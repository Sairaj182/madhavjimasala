# Madhavji Masala deployment runbook

This is the repeatable production deployment and recovery procedure for one EC2 host running Docker Compose, Caddy, PostgreSQL and Redis on a dedicated EBS volume. Cloudinary stores public product images. SSM provides host access. Container images are immutable Git commit SHA tags.

## Persistence contract

| Data | Primary location | Recovery copy |
| --- | --- | --- |
| PostgreSQL | `/mnt/data/postgres` on dedicated EBS | Encrypted off-instance dumps and EBS snapshots |
| Redis | `/mnt/data/redis` on dedicated EBS | Rebuildable application state |
| Product images | Cloudinary | Cloudinary storage plus `public_id` metadata |
| Application | GHCR images tagged by commit SHA | Git repository and prior image SHA |
| OpenTofu state | Versioned private S3 bucket | S3 object versions |
| Secrets | Restricted server runtime store | Password-manager escrow |

Never format an existing data volume during recovery. An EBS mount is persistence, not a backup.

## Repository source of truth

Keep these files in the repository:

```text
infra/                         OpenTofu infrastructure
apps/api/Dockerfile            API image
apps/web/Dockerfile            web image
deploy/compose.production.yml  production services
deploy/Caddyfile               reverse proxy
deploy/.env.production.example runtime template
scripts/                       bootstrap, deploy, backup, restore, health
packages/db/prisma/            schema and migrations
```

Record these external values securely: AWS account and region, state bucket, instance ID, EBS volume ID, DNS provider, Cloudinary environment, GHCR repositories, backup location, and current healthy image SHA.

## 1. Local preflight

From PowerShell:

```powershell
Set-Location C:\code\madhavjimasala
node --version
pnpm --version
docker version
docker compose version
tofu version
pnpm install --frozen-lockfile
pnpm --filter api check-types
pnpm --filter api lint
pnpm --filter web lint
pnpm --filter api build
pnpm --filter web build
tofu fmt -recursive infra
tofu -chdir=infra/environments/prod init -backend=false
tofu -chdir=infra/environments/prod validate
docker build -f apps/api/Dockerfile -t madhavji-api:local .
docker build -f apps/web/Dockerfile -t madhavji-web:local .
```

The Docker build context is the repository root. Use ARM64 only after testing Prisma, Sharp, and all native dependencies for ARM64; otherwise use x86_64.

Render Compose without starting it:

```powershell
Copy-Item deploy\.env.production.example deploy\.env.production.local
docker compose --env-file deploy\.env.production.local -f deploy\compose.production.yml config
```

Use dummy values only. Confirm only Caddy publishes ports 80 and 443.

## 2. One-time state and provider setup

Create one private S3 state bucket manually. Enable block public access, versioning, and encryption. Copy the backend example:

```powershell
Copy-Item infra\environments\prod\backend.tf.example infra\environments\prod\backend.tf
```

Replace the bucket placeholder only. Keep credentials in AWS CLI or SSO configuration. The backend uses OpenTofu S3 locking with `use_lockfile = true`.

Copy infrastructure variables:

```powershell
Copy-Item infra\environments\prod\terraform.tfvars.example infra\environments\prod\terraform.tfvars
```

Set region, architecture-compatible AMI, instance type, and volume size. Do not put application or cloud credentials in tfvars.

References: [OpenTofu install](https://opentofu.org/docs/intro/install/), [S3 backend](https://opentofu.org/docs/language/settings/backends/s3/), [AWS CLI configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

## 3. Cloudinary setup

Configure these server-side values:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=madhavji-masala
```

The API secret must never be a `NEXT_PUBLIC_*` variable or browser value. Store the secure URL and `public_id` for each managed image. The current URL-only image array needs a reviewed metadata change before automated deletion or replacement is safe. See [Cloudinary Node uploads](https://cloudinary.com/documentation/node_image_and_video_upload).

## 4. Build immutable images

Every release is a Git commit SHA. Publish both images with that SHA:

```powershell
docker buildx build --platform linux/arm64 -f apps/api/Dockerfile -t ghcr.io/OWNER/REPOSITORY-api:COMMIT_SHA --push .
docker buildx build --platform linux/arm64 -f apps/web/Dockerfile -t ghcr.io/OWNER/REPOSITORY-web:COMMIT_SHA --push .
```

Use `linux/amd64` for an x86 host. Never use `latest` as the deployment identity. Keep the previous healthy SHA for rollback.

## 5. Provision the first host

Authenticate and check the account:

```powershell
aws sts get-caller-identity
tofu -chdir=infra/environments/prod init
tofu -chdir=infra/environments/prod plan
```

Review the plan. It should include one EC2 host, one encrypted gp3 data volume and attachment, a security group, and an SSM role/profile. It should not include RDS, NAT Gateway, or public database ingress.

Only after reviewing the plan:

```powershell
tofu -chdir=infra/environments/prod apply
tofu -chdir=infra/environments/prod output
```

Record the instance ID, public IP, and EBS volume ID. Do not apply until the bootstrap can identify the intended data device safely; never format by device name alone.

References: [SSM instance permissions](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-permissions.html), [EBS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html).

## 6. Verify host persistence

Use Systems Manager Session Manager or Run Command. Verify:

```bash
findmnt /mnt/data
lsblk -f
df -h /mnt/data
test -d /mnt/data/postgres
test -d /mnt/data/redis
```

The data volume must be mounted before Docker starts PostgreSQL or Redis. If it already has a filesystem or data, do not run `mkfs`.

## 7. Recover the current host through SSM

The first user-data run may have stopped at the unavailable `awscli2` package. Editing local user-data does not rerun it on the current instance. The recovery wrapper sends the corrected `ec2-bootstrap.sh` through SSM to that same instance. The script checks that `aws` is available, identifies the attached `/dev/sdf` EBS volume by ID, and formats it only when it has no filesystem, partitions, signatures, or mount. An existing filesystem is preserved. Review the selected instance ID before sending the command.

From PowerShell, after configuring AWS CLI or SSO authentication:

```powershell
.\scripts\ssm-recover.ps1 -InstanceId i-REPLACE_WITH_CURRENT_INSTANCE_ID -Region ap-south-1 -DryRun
.\scripts\ssm-recover.ps1 -InstanceId i-REPLACE_WITH_CURRENT_INSTANCE_ID -Region ap-south-1 -Wait
```

If the wrapper prints `Submitted SSM recovery command: <command-id>` and then fails while polling, resume that command without submitting another one:

```powershell
.\scripts\ssm-recover.ps1 -InstanceId i-REPLACE_WITH_CURRENT_INSTANCE_ID -Region ap-south-1 -CommandId <command-id>
```

If SSM has no readable invocation, inspect the submitted command without resending it:

```powershell
aws ssm list-commands --region ap-south-1 --command-id <command-id> --output json
aws ssm list-command-invocations --region ap-south-1 --command-id <command-id> --details --output json
```

On Windows, if the AWS CLI reports a `charmap` encoding error while displaying SSM output, set `$env:AWS_CLI_OUTPUT_ENCODING = "UTF-8"` in that PowerShell session and retry reading the invocation. Check the `Status` and `ResponseCode` before deciding whether another recovery run is necessary.

The command installs Docker and XFS tools, mounts the volume by UUID, and creates the PostgreSQL, Redis, and application directories. It does not replace the EC2 instance or EBS volume. If `aws` is missing from the AMI, it stops with an explicit error; install a supported AWS CLI on the host before retrying. If SSM itself is offline, use the EC2 console's SSM diagnostics or another existing host access method to restore connectivity first.

Use the existing instance ID from OpenTofu when available:

```powershell
$InstanceId = tofu -chdir=infra/environments/prod output -raw instance_id
.\scripts\ssm-recover.ps1 -InstanceId $InstanceId -Region ap-south-1 -Wait
```

## 8. Install and configure the stack

Place these files under `/opt/madhavji`:

```text
compose.production.yml
Caddyfile
.env.production
scripts/
```

Set restricted permissions:

```bash
sudo chown root:root /opt/madhavji/.env.production
sudo chmod 600 /opt/madhavji/.env.production
```

Required runtime values include `DOMAIN`, PostgreSQL settings, application secrets, auth URLs, Cloudinary values, the two GHCR repository names, and the optional GHCR token file path. Never commit this file.

Start data services:

```bash
cd /opt/madhavji
export IMAGE_TAG=COMMIT_SHA
export API_IMAGE="$API_REPOSITORY:$IMAGE_TAG"
export WEB_IMAGE="$WEB_REPOSITORY:$IMAGE_TAG"
docker compose --env-file .env.production -f compose.production.yml up -d postgres redis
docker compose --env-file .env.production -f compose.production.yml ps
```

## 9. Migrate and start

Back up before every migration:

```bash
/opt/madhavji/scripts/backup.sh
```

Run Prisma migration exactly once using the verified command for the final API image:

```bash
docker compose --env-file .env.production -f compose.production.yml run --rm api <verified-prisma-migrate-deploy-command>
```

Do not migrate from every API startup. Then start the stack:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d
docker compose --env-file .env.production -f compose.production.yml ps
/opt/madhavji/scripts/health.sh
```

Verify `https://YOUR_DOMAIN/api/health`, login, product images, product upload, checkout, orders, and admin flows.

## 10. Deploy and roll back

Deployment order: publish one SHA, back up PostgreSQL, pull that SHA, run migration once, recreate web/API, check health, and retain the previous SHA.

```bash
/opt/madhavji/scripts/deploy.sh deploy COMMIT_SHA
/opt/madhavji/scripts/deploy.sh rollback PREVIOUS_COMMIT_SHA
/opt/madhavji/scripts/deploy.sh health
/opt/madhavji/scripts/deploy.sh logs
```

A deployment must fail before replacing healthy services if backup, migration, or health checks fail. Use backward-compatible schema changes so application rollback remains safe.

## 11. Back up and restore PostgreSQL

Run logical backups before migrations and on a schedule:

```bash
/opt/madhavji/scripts/backup.sh
```

Copy each backup to encrypted off-instance storage with at least 7 daily and 4 weekly copies. A backup left on EBS does not protect against loss of the host or volume. Record backup timestamp, database version, image SHA, object key, and restore result.

Restore only after verifying the selected backup:

```bash
/opt/madhavji/scripts/deploy.sh restore /path/to/verified-backup.sql.gz
```

Perform restore drills separately before relying on recovery. Redis queues and cache must be safe to rebuild.

## 12. Recreate the deployment with persistence

### Containers or host software lost

Keep the existing EBS volume. Reinstall Docker and deployment files, mount the existing volume at `/mnt/data` without formatting, restore `.env.production`, and start the last healthy image SHA.

### EC2 lost, EBS preserved

1. Provision a replacement in the same availability zone.
2. Attach the existing EBS volume.
3. Verify filesystem UUID and contents.
4. Mount it at `/mnt/data` without formatting.
5. Install Docker, Compose files, scripts, and runtime secrets.
6. Start PostgreSQL and Redis from the existing directories.
7. Deploy the last healthy application SHA.
8. Check health and order flows.
9. Update DNS after verification.

### EBS lost or corrupted

1. Restore the latest verified EBS snapshot to a new volume, or create a new volume.
2. Mount a restored snapshot without formatting.
3. Restore PostgreSQL from the latest verified off-instance dump if needed.
4. Recreate Redis state.
5. Deploy the last healthy image SHA.
6. Verify the recovery point and critical data.

## 13. Routine checks

Weekly:

```bash
docker compose -f /opt/madhavji/compose.production.yml ps
df -h /mnt/data
docker system df
```

Also verify Systems Manager availability and the newest off-instance backup.

Monthly, perform a restore drill, test rollback, review AWS billing and Cloudinary usage, and confirm the state bucket remains private and versioned.

## Readiness gate

Call the deployment reproducible only after these pass: both image builds for the selected architecture; Compose config; safe EBS mount; one-time migration; Cloudinary upload and metadata lifecycle; off-instance backup and restore; SSM access; commit-SHA deployment; rollback; and replacement-host recovery.

Official references: [OpenTofu CLI](https://opentofu.org/docs/cli/), [Docker Compose](https://docs.docker.com/compose/), [AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html), [Cloudinary uploads](https://cloudinary.com/documentation/node_image_and_video_upload), [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws), [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

