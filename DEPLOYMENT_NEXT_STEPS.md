# Madhavji Masala deployment: exact next steps

This guide starts from the current repository state. The deployment work is in progress; do **not** create AWS resources yet. Compose, EC2 bootstrap, Cloudinary asset lifecycle, CI workflows, and backup delivery still need review or completion. The commands below begin with local-only checks.

## 0. Confirm the local worktree

Run PowerShell from the repository root. No steps in sections 1–4 need cloud credentials.

```powershell
Set-Location C:\code\madhavjimasala
git status --short --branch
```

Confirm your existing branch and changes are present. Do not reset or clean the worktree.

## 1. Check local tools

Required: Node.js 22, Corepack, pnpm 10.12.1, Docker Desktop with Linux containers, and OpenTofu.

```powershell
node --version
corepack --version
pnpm --version
docker version
docker compose version
tofu version
```

If `tofu` is not recognized, install it using [OpenTofu's Windows installation instructions](https://opentofu.org/docs/intro/install/), open a new PowerShell window, and rerun `tofu version`. References: [Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/), [Node Corepack](https://nodejs.org/api/corepack.html).

## 2. Format and validate OpenTofu locally

```powershell
tofu fmt -recursive infra
tofu -chdir=infra/environments/prod init -backend=false
tofu -chdir=infra/environments/prod validate
```

`fmt` formats local files. `init -backend=false` installs the provider without contacting the S3 backend. `validate` checks the configuration but does not provision infrastructure. `init` may download the AWS provider. References: [fmt](https://opentofu.org/docs/cli/commands/fmt/), [init](https://opentofu.org/docs/cli/init/), [validate](https://opentofu.org/docs/cli/commands/validate/).

Do not run `tofu apply` or `tofu destroy` during local validation.

## 3. Validate app and container builds

```powershell
pnpm install --frozen-lockfile
pnpm --filter api check-types
pnpm --filter api lint
pnpm --filter web lint
pnpm --filter web build
pnpm --filter api build
docker build -f apps/api/Dockerfile -t madhavji-api:local .
docker build -f apps/web/Dockerfile -t madhavji-web:local .
```

Both Docker builds must run from the monorepo root. Docker requires its engine to be running. Before relying on `t4g`, build and run both images for `linux/arm64`; otherwise select x86_64 instance/AMI.

For a Compose parse/render check, copy the example to an untracked local file, replace placeholders with dummy-only values, and render without starting containers:

```powershell
Copy-Item deploy\.env.production.example deploy\.env.production.local
docker compose --env-file deploy\.env.production.local -f deploy\compose.production.yml config
```

Inspect the result: only Caddy should publish host ports; PostgreSQL and Redis must not. Never put real production credentials into a checked-in file. Do not start this production Compose stack on a machine with important data.

## 4. Finish local implementation before provisioning

These items are still open in the current repository:

1. Ensure the API image bundles Prisma CLI and migration files; verify the exact one-time migration command inside that image.
2. Fix Compose networking so Caddy reaches both app containers. Review `/api` routing against actual route prefixes.
3. Make EC2 bootstrap identify the attached EBS data volume safely and consistently. Never format a disk based only on a device name. Ensure mounting happens before PostgreSQL/Redis start.
4. Make deployments use immutable commit tags, back up before migrations, run migrations once, check health, and retain a prior tag for rollback.
5. Store Cloudinary `public_id` with image URL and implement safe replace/delete. Existing product images must not be bulk-uploaded automatically.
6. Send encrypted PostgreSQL backups off-instance, set retention, and test restoration. The current local dump alone cannot recover a lost host/volume.
7. Add GitHub Actions workflows and complete GHCR private-image pull authentication without committing a long-lived token.
8. Add and review deployment instructions for the finished implementation.

After fixing these, repeat sections 2–3. For shell script syntax, use WSL or Linux:

```bash
bash -n scripts/*.sh
```

## 5. AWS preparation (later)

Do this only after local builds, the bootstrap, backups, and workflow have passed review.

1. Select one AWS account and region for production. Do not rotate a live database between credit accounts.
2. Manually create a dedicated S3 bucket for OpenTofu state. Enable versioning, block public access, and encryption. The bucket must exist before remote-backend initialization.
3. Copy `infra/environments/prod/backend.tf.example` to `backend.tf`; replace the bucket placeholder. Keep authentication in AWS CLI/SSO configuration, never in backend arguments.
4. Copy `terraform.tfvars.example` to `terraform.tfvars`. Set region, valid regional AMI ID matching CPU architecture, instance type, and data-volume size. Do not put secrets in tfvars.
5. Authenticate through your existing AWS CLI/SSO setup, then verify the active identity:

```powershell
aws sts get-caller-identity
```

6. Initialize the real backend and inspect the plan:

```powershell
tofu -chdir=infra/environments/prod init
tofu -chdir=infra/environments/prod plan
```

Review each proposed resource and cost. The plan should show the intended EC2 host, encrypted gp3 data volume and attachment, security group, and SSM role/profile. A plan does not create resources. Apply only after separately reviewing the corrected bootstrap and approving the plan.

OpenTofu recommends S3 versioning and supports S3-native state locking with `use_lockfile`: [S3 backend docs](https://opentofu.org/docs/language/settings/backends/s3/). AWS references: [CLI configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html), [SSM instance permissions](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-permissions.html).

## 6. Cloudinary setup (later)

1. Create/select a Cloudinary product environment.
2. Put cloud name, API key, and API secret into a secure server-side runtime secret store.
3. Set `CLOUDINARY_FOLDER=madhavji-masala`.
4. Confirm the API secret is absent from `NEXT_PUBLIC_*`, browser code, web build arguments, and client requests.
5. Test one image in non-production: file type/size validation, returned secure URL, persistence, and failure behavior.

The current code stores the URL in the existing product image array but does not yet persist `public_id`; safe deletion/replacement is therefore not complete. Cloudinary docs: [Node.js server-side uploads](https://cloudinary.com/documentation/node_image_and_video_upload). Never bulk-migrate existing assets without a separate reviewed migration.

## 7. GitHub setup (later)

After workflow files are present and reviewed:

1. Create an AWS IAM OIDC provider and a narrowly scoped role restricted to this repository and deployment branch/environment.
2. Add required GitHub environment variables, such as AWS region and EC2 instance ID. Prefer OIDC to long-lived AWS keys.
3. Configure GHCR package access and a scoped, replaceable method for the EC2 host to pull private images.
4. Keep Cloudinary credentials on the server if CI only builds and deploys images; add protected environment secrets only if the workflow truly needs them.
5. Test staging first. Verify the deployed image tag is the triggering commit SHA, never only `latest`.

References: [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws), [publish Docker images to GHCR](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images).

## 8. First deployment (later)

1. Point DNS to the instance IP and set the production domain.
2. Confirm EC2 is online in Systems Manager.
3. Confirm the EBS data volume is mounted at `/mnt/data`; verify PostgreSQL and Redis directories are on that volume, not root disk.
4. Put production environment values in a server-side file/secret store with restricted permissions.
5. Deploy a specific commit SHA. Confirm the pre-migration backup completed, then migration, Compose health, and `https://YOUR_DOMAIN/api/health`.
6. Check sign-in, product catalog, Cloudinary image upload, checkout/order creation, admin operations, and enabled notifications.
7. Test rollback to the prior healthy SHA in staging.

The current deployment script and Compose contract may need alignment before these steps work. This is the target procedure, not a verified production deployment.

## 9. Recovery outline

Preserve the old EBS volume. Attach it to a replacement host in the same availability zone or restore a snapshot into a compatible zone. Mount the verified volume without formatting. If the database volume is damaged or lost, restore the latest verified off-instance backup, deploy the last healthy image SHA, then check API health and order flows. Reconcile orders newer than the backup from operational records. This is not a proven recovery plan until off-instance backup and restore drills are complete.

## Current readiness limits

- `tofu validate` has not yet succeeded in this environment.
- EBS volume identification/format safety needs correction before apply.
- Current EC2 config uses the default VPC and a dynamic public IP; choose stable addressing/DNS before production.
- Cloudinary `public_id` lifecycle is unfinished.
- CI workflows, off-instance backup, and restore test are unfinished.
- Compose routing, ARM64 compatibility, TLS, migration, and rollback have not been verified end to end.

Use the repository for local review and validation until these are resolved; it is not production-ready yet.
