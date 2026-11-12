# Madhavji Masala: master deployment guide

This is the canonical guide for taking the Madhavji Masala application from the repository to a repeatable production deployment and recovering it later.

The design uses:

- OpenTofu for infrastructure
- One AWS EC2 instance
- One encrypted gp3 EBS data volume
- Docker Compose
- PostgreSQL in Docker
- Redis in Docker
- Caddy for HTTPS and reverse proxying
- Cloudinary for public product images
- AWS Systems Manager for host access and deployment
- GHCR for immutable application images
- GitHub Actions for checks, image publishing, deployment, and rollback

No real credentials belong in this repository.

## 1. Target architecture

    DNS provider
        |
        v
    EC2 public IP / Elastic IP
        |
        v
    Caddy :80/:443
        |
        +--> web:3000
        +--> api:4000
                 |
                 +--> postgres:5432
                 +--> redis:6379

    EBS data volume
        +--> /mnt/data/postgres
        +--> /mnt/data/redis

    Cloudinary
        +--> public product images

    S3
        +--> OpenTofu state
        +--> optional encrypted PostgreSQL backups

Only Caddy publishes host ports. PostgreSQL and Redis stay on the private Compose network.

## 2. Repository source of truth

Important files:

    infra/
      environments/prod/          OpenTofu production environment
      modules/                    future reusable modules

    apps/api/Dockerfile            API production image
    apps/web/Dockerfile            Next.js production image
    deploy/compose.production.yml  production Compose stack
    deploy/Caddyfile               reverse proxy
    deploy/.env.production.example runtime environment template

    scripts/ec2-bootstrap.sh       EC2 Docker and EBS bootstrap
    scripts/deploy.sh              deploy, rollback, backup, restore, health, logs
    scripts/backup.sh              PostgreSQL backup
    scripts/restore.sh             PostgreSQL restore
    scripts/health.sh              application health check

    packages/db/prisma/schema.prisma
    packages/db/prisma/migrations/

    .github/workflows/
      checks.yml
      images.yml
      deploy.yml
      rollback.yml

Supporting documents:

- [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)
- [AUTOMATION_OPERATIONS.md](./AUTOMATION_OPERATIONS.md)
- [DEPLOYMENT_NEXT_STEPS.md](./DEPLOYMENT_NEXT_STEPS.md)

This document is the entry point. The supporting documents contain deeper operational detail.

## 3. Persistence and recovery rules

| Data | Primary location | Recovery copy |
| --- | --- | --- |
| PostgreSQL | EBS at /mnt/data/postgres | Encrypted off-instance dumps and EBS snapshots |
| Redis | EBS at /mnt/data/redis | Rebuildable state |
| Product images | Cloudinary | Cloudinary storage and public_id metadata |
| Application images | GHCR | Git commit and previous image SHA |
| OpenTofu state | Versioned private S3 bucket | S3 object versions |
| Runtime secrets | Restricted server secret files | Password manager |

Rules:

1. Never format a volume during recovery.
2. Never treat the EBS volume as the only database backup.
3. Never deploy the mutable latest tag.
4. Never store secrets in Git, tfvars, Docker images, or browser variables.
5. Always back up PostgreSQL before migrations.
6. Always retain the previous healthy application SHA.
7. Always test restoration before depending on it.

## 4. Manual prerequisites

You must provide these outside the repository:

- AWS account and region
- AWS CLI or SSO access
- OpenTofu installation
- Docker Desktop for local builds
- A private versioned S3 state bucket
- A regional AMI ID matching the chosen CPU architecture
- A domain and DNS provider
- Cloudinary product environment
- GHCR package access
- GitHub repository environment configuration
- AWS GitHub OIDC role
- Database and application secrets
- Backup destination and backup passphrase
- Production approval before infrastructure apply

The repository does not create these prerequisites automatically.

## 5. Local tool checks

From PowerShell:

    Set-Location C:\code\madhavjimasala

    node --version
    pnpm --version
    docker version
    docker compose version
    tofu version

The repository expects pnpm 10.12.1 and Node 22.

## 6. Local application validation

Run:

    pnpm install --frozen-lockfile
    pnpm --filter api check-types
    pnpm --filter api lint
    pnpm --filter web lint
    pnpm --filter api build
    pnpm --filter web build

Build both production images from the repository root:

    docker build -f apps/api/Dockerfile -t madhavji-api:local .
    docker build -f apps/web/Dockerfile -t madhavji-web:local .

For the current x86_64 T3 deployment:

    docker buildx build --platform linux/amd64 -f apps/api/Dockerfile -t madhavji-api:amd64 .
    docker buildx build --platform linux/amd64 -f apps/web/Dockerfile -t madhavji-web:amd64 .

If returning to Graviton later, change the image workflow and AMI back to ARM64 and build:

    docker buildx build --platform linux/arm64 -f apps/api/Dockerfile -t madhavji-api:arm64 .
    docker buildx build --platform linux/arm64 -f apps/web/Dockerfile -t madhavji-web:arm64 .

The GHCR image workflow currently publishes linux/amd64 only. Existing ARM64-only image tags cannot run on a T3 host; publish a new commit SHA before deploying.

## 7. Local Compose validation

Create an untracked local environment file:

    Copy-Item deploy\.env.production.example deploy\.env.production.local

Put dummy values in it, then render the configuration:

    docker compose --env-file deploy\.env.production.local -f deploy\compose.production.yml config

Confirm:

- web, api, postgres, redis, and caddy exist
- only Caddy publishes ports 80 and 443
- PostgreSQL and Redis use /mnt/data bind mounts
- image values are immutable
- no production secret is present in the repository

Do not start the production Compose file on a machine containing important data.

## 8. OpenTofu validation

Format and validate without contacting the remote backend:

    tofu fmt -recursive infra
    tofu -chdir=infra/environments/prod init -backend=false
    tofu -chdir=infra/environments/prod validate

The OpenTofu environment provisions:

- EC2 instance
- Elastic IP
- encrypted gp3 EBS data volume
- volume attachment
- security group
- SSM instance profile
- volume discovery permissions
- optional S3 backup permissions
- useful outputs and resource tags

Do not run apply until the EBS bootstrap logic and cost plan have been reviewed.

## 9. One-time OpenTofu state setup

Create a private S3 bucket manually. Enable:

- Block public access
- Versioning
- Encryption
- Lifecycle cleanup for old versions

Copy the backend template:

    Copy-Item infra\environments\prod\backend.tf.example infra\environments\prod\backend.tf

Replace the state bucket placeholder. Keep AWS authentication in the AWS CLI or SSO configuration.

Copy variables:

    Copy-Item infra\environments\prod\terraform.tfvars.example infra\environments\prod\terraform.tfvars

Set:

    region         = "ap-south-1"
    environment    = "prod"
    instance_type  = "t3.small"
    subnet_id      = null
    ami_id         = "ami-REPLACE_WITH_X86_64_AL2023_AMI"
    data_volume_gb = 50
    backup_bucket_arn = null

Set backup_bucket_arn only if the EC2 role should upload backups to an AWS S3 bucket.

The default subnet selection uses the first subnet returned for the default VPC. If EC2 reports `Server.InsufficientInstanceCapacity`, identify the current subnet's Availability Zone and list other public subnets in that VPC:

    aws ec2 describe-subnets --region ap-south-1 --subnet-ids CURRENT_SUBNET_ID --query "Subnets[].{Id:SubnetId,AZ:AvailabilityZone,Vpc:VpcId}" --output table
    aws ec2 describe-subnets --region ap-south-1 --filters "Name=vpc-id,Values=YOUR_VPC_ID" --query "Subnets[].{Id:SubnetId,AZ:AvailabilityZone,PublicIp:MapPublicIpOnLaunch}" --output table

Set `subnet_id` in the untracked `terraform.tfvars` to a public subnet in a different Availability Zone. Re-run `tofu plan -out=prod.plan`, inspect the plan, then `tofu apply prod.plan`. A listed instance type does not guarantee spare capacity in an AZ. If an instance or data volume already exists, review replacement actions and data persistence before changing the subnet.

For T3, retrieve the current x86_64 AL2023 AMI in the deployment region and put the returned `ami-...` ID in `terraform.tfvars`:

    aws ssm get-parameter --region ap-south-1 --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text

Keep `instance_type`, AMI architecture, and published image platform aligned. `t3.small` has 2 GiB RAM; monitor memory for the five-container stack and consider `t3.medium` (4 GiB) if needed.

## 10. First infrastructure plan and apply

Verify the AWS identity:

    aws sts get-caller-identity

Initialize and inspect:

    tofu -chdir=infra/environments/prod init
    tofu -chdir=infra/environments/prod plan

The plan should contain one host, one data volume, one attachment, one Elastic IP, one security group, and SSM permissions. It should not contain RDS, NAT Gateway, load balancer, or public database ingress.

After reviewing the plan:

    tofu -chdir=infra/environments/prod apply
    tofu -chdir=infra/environments/prod output

Record:

- instance ID
- Elastic IP
- EBS volume ID
- AWS region
- OpenTofu state bucket
- selected architecture
- selected application SHA

## 11. EC2 bootstrap

The bootstrap script installs Docker and XFS tools, checks that the AMI provides `aws`, discovers the volume attached as /dev/sdf, waits for attachment if necessary, formats only a volume without a filesystem, partitions, signatures, or mount, mounts it by UUID, and creates:

    /mnt/data/postgres
    /mnt/data/redis
    /opt/madhavji

After the instance is online in Systems Manager, verify:

    findmnt /mnt/data
    lsblk -f
    df -h /mnt/data
    test -d /mnt/data/postgres
    test -d /mnt/data/redis

If the volume has an existing filesystem or data, do not run mkfs.

If the first user-data run failed (for example, because `awscli2` was unavailable), editing this repository does not repair the already running instance. From the repository root, send the corrected bootstrap to the current instance through SSM:

```powershell
$InstanceId = tofu -chdir=infra/environments/prod output -raw instance_id
.\scripts\ssm-recover.ps1 -InstanceId $InstanceId -Region ap-south-1 -DryRun
.\scripts\ssm-recover.ps1 -InstanceId $InstanceId -Region ap-south-1 -Wait
```

The SSM run uses the same guarded script. It does not replace the instance or EBS volume. Check `/var/log/cloud-init-output.log` and the SSM command output if it fails; an AMI without `aws` requires a supported AWS CLI installation before retrying.

## 12. Cloudinary configuration

Configure these values only in the API runtime environment:

    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    CLOUDINARY_FOLDER=madhavji-masala

The API validates image type and size, converts images to WebP, uploads server-side, and stores the returned URL and asset metadata.

The API secret must never be:

- a NEXT_PUBLIC variable
- included in the web image
- returned to the browser
- committed to Git

Cloudinary is for public images. It is not a PostgreSQL backup system.

## 13. Runtime environment

Create /opt/madhavji/.env.production on the server. Use the repository template as the starting point.

Required categories include:

    DOMAIN
    POSTGRES_DB
    POSTGRES_USER
    POSTGRES_PASSWORD
    JWT_SECRET
    BETTER_AUTH_SECRET
    BETTER_AUTH_URL
    CORS_ORIGIN
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
    CLOUDINARY_FOLDER
    API_REPOSITORY
    WEB_REPOSITORY
    GHCR_USERNAME
    GHCR_TOKEN_FILE
    BACKUP_S3_URI
    BACKUP_RETENTION_DAYS
    BACKUP_PASSPHRASE_FILE

Set permissions:

    sudo chown root:root /opt/madhavji/.env.production
    sudo chmod 600 /opt/madhavji/.env.production

Store the GHCR token and backup passphrase in separate root-readable files with restrictive permissions.

## 14. Image publishing

Images are published with a commit SHA:

    ghcr.io/OWNER/REPOSITORY-api:COMMIT_SHA
    ghcr.io/OWNER/REPOSITORY-web:COMMIT_SHA

The image workflow builds and pushes images. The deploy workflow uses a manually supplied commit SHA. The server pulls that exact SHA.

Never use latest as the deployment identity.

## 15. First server startup

From PowerShell at the repository root, stage non-secret files through SSM:

```powershell
$InstanceId = tofu -chdir=infra/environments/prod output -raw instance_id
.\scripts\ssm-stage.ps1 -InstanceId $InstanceId -Region ap-south-1 -DryRun
.\scripts\ssm-stage.ps1 -InstanceId $InstanceId -Region ap-south-1
```

The staging helper sends small SSM commands in sequence and stops if any command fails. Wait for its final success message before continuing. This stages these files at /opt/madhavji:

    compose.production.yml
    Caddyfile
    scripts/

Create `.env.production` separately on the server with real values; the staging command deliberately never transfers credentials. Check `docker compose version` on the host. On this Amazon Linux setup, Docker may be installed without Compose. The bootstrap selects and verifies the Compose plugin for the host's CPU architecture. Editing user-data does not rerun it on an existing instance. Do not start services until `sudo docker compose version` succeeds.

Start PostgreSQL and Redis:

    cd /opt/madhavji
    export IMAGE_TAG=COMMIT_SHA
    export API_IMAGE="$API_REPOSITORY:$IMAGE_TAG"
    export WEB_IMAGE="$WEB_REPOSITORY:$IMAGE_TAG"
    docker compose --env-file .env.production -f compose.production.yml up -d postgres redis

Back up before migration:

    /opt/madhavji/scripts/backup.sh

Run Prisma migration exactly once using the verified command for the final API image:

    docker compose --env-file .env.production -f compose.production.yml run --rm api <verified-prisma-migrate-deploy-command>

Start the whole stack:

    docker compose --env-file .env.production -f compose.production.yml up -d
    docker compose --env-file .env.production -f compose.production.yml ps
    /opt/madhavji/scripts/health.sh

Verify the health URL, login, catalog, image upload, checkout, orders, admin pages, and enabled notifications.

### Create the initial superadmin

The API image includes the compiled `apps/api/dist/seed-superadmin.cjs` entry. After the migration has succeeded, connect with Session Manager and start a root shell. Enter the email and password interactively so the password is not written into shell history or the production environment file:

    sudo bash
    cd /opt/madhavji
    read -r -p 'Superadmin email: ' SUPERADMIN_EMAIL
    read -r -s -p 'Superadmin password: ' SUPERADMIN_PASSWORD
    printf '\n'
    export SUPERADMIN_EMAIL SUPERADMIN_PASSWORD
    docker compose --env-file .env.production -f compose.production.yml run --rm -e SUPERADMIN_EMAIL -e SUPERADMIN_PASSWORD api node apps/api/dist/seed-superadmin.cjs
    unset SUPERADMIN_EMAIL SUPERADMIN_PASSWORD
    exit

Use a strong password and save it in a password manager. The script creates a new user and assigns `SUPER_ADMIN`; if that email already exists, it promotes the existing user without changing its password. Verify the email carefully before running it. Run this only once for initial setup or intentionally to promote an existing account. The compiled entry must exist in the published image SHA; older API images do not contain it.

## 16. Automated deployment

The deployment workflow is:

    release commit
      -> checks
      -> image build and GHCR publish
      -> GitHub OIDC authentication
      -> SSM Run Command
      -> PostgreSQL backup
      -> GHCR login
      -> pull exact SHA
      -> one Prisma migration
      -> Compose restart
      -> health check

The target host command is:

    /opt/madhavji/scripts/deploy.sh deploy COMMIT_SHA

The deployment must fail if backup, migration, or health check fails.

The workflow files are:

    .github/workflows/checks.yml
    .github/workflows/images.yml
    .github/workflows/deploy.yml
    .github/workflows/rollback.yml

## 17. Rollback

Rollback to a previous healthy SHA:

    /opt/madhavji/scripts/deploy.sh rollback PREVIOUS_COMMIT_SHA

The workflow rollback action invokes the same command through SSM.

Application rollback is safe only when database migrations are backward compatible. For destructive schema changes, create a separate recovery migration.

## 18. PostgreSQL backup and restore

Create a backup:

    /opt/madhavji/scripts/backup.sh

The script:

- runs pg_dump through the PostgreSQL container
- compresses the dump
- encrypts it when BACKUP_PASSPHRASE_FILE is configured
- uploads it when BACKUP_S3_URI is configured
- removes backups older than BACKUP_RETENTION_DAYS

Restore:

    /opt/madhavji/scripts/deploy.sh restore /path/to/verified-backup.sql.gz
    /opt/madhavji/scripts/deploy.sh restore /path/to/verified-backup.sql.gz.enc

Run restore drills in a separate environment first. Record the backup timestamp, checksum, image SHA, and restore result.

## 19. Recreate the deployment

### Containers fail

Keep the EBS volume. Reinstall or restart Docker, restore runtime files, and deploy the last healthy image SHA.

### EC2 instance fails but EBS survives

1. Provision a replacement instance in the same availability zone.
2. Attach the existing EBS volume.
3. Verify UUID and contents.
4. Mount it at /mnt/data without formatting.
5. Install Docker and deployment files.
6. Restore runtime secrets.
7. Start PostgreSQL and Redis from the existing directories.
8. Deploy the last healthy SHA.
9. Verify health and order flows.
10. Update DNS if required.

### EBS fails

1. Restore the latest verified EBS snapshot to a new volume.
2. Mount it without formatting.
3. Restore PostgreSQL from the latest encrypted off-instance dump if necessary.
4. Rebuild Redis state.
5. Deploy the last healthy SHA.
6. Verify business data and the recovery timestamp.

## 20. GitHub manual configuration

Configure these manually in the repository/environment:

    AWS_ROLE_TO_ASSUME
    AWS_REGION
    EC2_INSTANCE_ID

Configure:

- GitHub OIDC provider and AWS trust role
- GHCR package permissions
- Production environment protection
- Branch restrictions
- Deployment approval rules
- Any protected secrets required by the workflows

The workflows must use OIDC instead of long-lived AWS keys.

## 21. DNS and HTTPS manual configuration

The current OpenTofu code intentionally does not provision DNS.

Manually:

1. Create an A record pointing to the Elastic IP.
2. Configure proxy mode if your DNS provider supports it.
3. Confirm ports 80 and 443 are reachable.
4. Confirm Caddy obtains the certificate.
5. Update DNS only after a replacement host passes health checks.

## 22. Routine production operations

Weekly:

    docker compose -f /opt/madhavji/compose.production.yml ps
    df -h /mnt/data
    docker system df

Also verify:

- Systems Manager status
- newest off-instance backup
- backup age
- disk capacity
- PostgreSQL health
- Cloudinary usage
- application health endpoint

Monthly:

- perform a restore drill
- test rollback
- review AWS billing
- review Cloudinary usage
- review old images and backups
- confirm OpenTofu state bucket versioning
- verify the current production SHA is recorded

## 23. Production readiness gate

The deployment is ready only after all of these pass:

- API and web images build for the selected architecture
- Type checks, lint, and builds pass
- Compose config renders successfully
- OpenTofu fmt and validate pass
- EBS mounts by UUID without unsafe formatting
- PostgreSQL and Redis persist on the data volume
- Prisma migration runs once
- Cloudinary upload and asset metadata work
- Encrypted off-instance backup succeeds
- Restore succeeds in a separate environment
- SSM reaches the instance
- GHCR pull works
- SHA deployment succeeds
- rollback succeeds
- replacement-host recovery is rehearsed
- DNS and Caddy HTTPS work
- critical customer and admin flows work

## 24. Official references

- OpenTofu CLI: https://opentofu.org/docs/cli/
- OpenTofu S3 backend: https://opentofu.org/docs/language/settings/backends/s3/
- Docker Compose: https://docs.docker.com/compose/
- AWS Systems Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
- AWS EBS volumes: https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html
- Cloudinary Node uploads: https://cloudinary.com/documentation/node_image_and_video_upload
- GitHub OIDC with AWS: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws
- GitHub Container Registry: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

