# Madhavji Masala automation and manual operations

This document describes what the repository automates, what the planned CI/CD flow automates, and what an operator must still configure or approve.

Target flow:

    Git commit
      -> local or CI checks
      -> build immutable API and web images
      -> publish images to GHCR
      -> invoke AWS SSM
      -> backup PostgreSQL
      -> run one migration
      -> start Compose
      -> health check
      -> retain previous image SHA for rollback

## Automation status

| Area | Repository automation | Status |
| --- | --- | --- |
| Package installation | pnpm install --frozen-lockfile | Available |
| API checks | Type check, lint, build | Available |
| Web checks | Lint and build | Available |
| API and web images | Dockerfiles | Added; local build verification required |
| Production services | deploy/compose.production.yml | Added; runtime verification required |
| Reverse proxy | deploy/Caddyfile | Added; DNS remains manual |
| EC2 bootstrap | scripts/ec2-bootstrap.sh | Added; disk identification requires safety review |
| Deployment | scripts/deploy.sh | Added; Prisma command and registry login require verification |
| Rollback | deploy.sh rollback | Added; must be tested |
| PostgreSQL backup | scripts/backup.sh | Added; off-instance copy still required |
| PostgreSQL restore | scripts/restore.sh | Added; restore drill is manual |
| Health check | scripts/health.sh | Added; domain and TLS are required |
| Cloudinary upload | API product image route | Added; asset ID lifecycle requires completion |
| OpenTofu infrastructure | infra/environments/prod | Added; plan and apply are operator actions |
| SSM deployment | Intended invocation method | IAM and command invocation remain manual |
| GitHub Actions | `.github/workflows/` | Added; repository/environment configuration and first run remain manual |
| DNS | Deliberately outside OpenTofu | Manual |
| Secrets | Placeholder templates only | Manual |

A status marked as requiring verification is not production-ready.

## 1. Local automation

Run from the repository root:

    pnpm install --frozen-lockfile
    pnpm --filter api check-types
    pnpm --filter api lint
    pnpm --filter web lint
    pnpm --filter api build
    pnpm --filter web build

OpenTofu checks:

    tofu fmt -recursive infra
    tofu -chdir=infra/environments/prod init -backend=false
    tofu -chdir=infra/environments/prod validate

These commands do not create AWS resources.

## 2. Image automation

Each release is identified by one Git commit SHA. Build and publish images with that SHA:

    docker buildx build --platform linux/arm64 -f apps/api/Dockerfile -t ghcr.io/OWNER/REPOSITORY-api:COMMIT_SHA --push .
    docker buildx build --platform linux/arm64 -f apps/web/Dockerfile -t ghcr.io/OWNER/REPOSITORY-web:COMMIT_SHA --push .

Use linux/amd64 for an x86 host. The selected EC2 architecture, AMI, Docker images, Prisma engine, Sharp, and native dependencies must match.

Never use latest as the release identity. Retain the previous healthy SHA for rollback.

## 3. OpenTofu automation

OpenTofu defines the EC2 host, encrypted gp3 data volume, EBS attachment, security group, IAM instance role, SSM profile, tags, and outputs.

The normal flow is:

    tofu -chdir=infra/environments/prod init
    tofu -chdir=infra/environments/prod plan
    tofu -chdir=infra/environments/prod apply

OpenTofu does not create the initial state bucket, provide credentials, choose an AMI, configure DNS, create application secrets, or create Cloudinary/GHCR settings.

The state bucket is a manual bootstrap dependency. It must be private, encrypted, versioned, and configured for S3 locking before the remote backend is used. Do not delete it during an application redeployment.

Reference: https://opentofu.org/docs/language/settings/backends/s3/

## 4. EC2 bootstrap automation

The bootstrap script is intended to install Docker, create the data mount, identify and mount the attached EBS volume, create the PostgreSQL and Redis directories, and prepare the application directory.

The operator must verify the volume matching logic before applying infrastructure. A bootstrap script must never format a disk based only on a guessed device name.

After the host is online, verify:

    findmnt /mnt/data
    lsblk -f
    df -h /mnt/data
    test -d /mnt/data/postgres
    test -d /mnt/data/redis

## 5. Compose automation

The production Compose file defines postgres, redis, api, web, and caddy.

Compose automates container creation, restart policies, internal networking, bind mounts, health checks, image selection, and Caddy port publishing.

Only Caddy should publish ports 80 and 443. PostgreSQL and Redis should be reachable only over the internal Compose network.

The operator supplies DOMAIN, database settings, application secrets, auth URLs, Cloudinary values, and GHCR repository names. Compose does not create DNS records, rotate secrets, or provision EBS.

## 6. Migration automation

Prisma migrations live under packages/db/prisma/migrations.

The intended release order is:

    backup PostgreSQL
      -> run Prisma migrate deploy once
      -> recreate API and web
      -> health check

The exact Prisma command must be verified against the final API image. It must not run from every API startup.

The operator reviews migration SQL, confirms a backup exists, checks the exit status, and keeps the prior application SHA. Use backward-compatible schema changes where rollback may be required.

## 7. Backup and restore automation

The backup script creates a compressed PostgreSQL dump:

    /opt/madhavji/scripts/backup.sh

The current script writes locally. Production automation still needs an encrypted off-instance upload, retention, checksum verification, and scheduling.

A local dump on the same EBS volume is not sufficient recovery protection.

Restore command:

    /opt/madhavji/scripts/deploy.sh restore /path/to/verified-backup.sql.gz

The operator selects and verifies the backup, isolates writes, restores, runs health and business checks, and records the recovery point. Restore drills must run in a separate environment before production reliance.

## 8. Deployment and rollback automation

Deployment target:

    /opt/madhavji/scripts/deploy.sh deploy COMMIT_SHA

The intended script sequence is backup, immutable image selection, one migration, Compose recreation, and health check.

Rollback:

    /opt/madhavji/scripts/deploy.sh rollback PREVIOUS_COMMIT_SHA

The deployment must fail before replacing healthy services when backup, migration, or health checks fail. The deployment should later be invoked through SSM Run Command or GitHub Actions, never through a public deployment endpoint.

## 9. SSM automation

SSM is the intended host access path. The OpenTofu instance profile provides the managed-node permissions.

SSM can later automate deployment, status checks, logs, backups, health checks, and rollback.

Manual AWS work remains:

- Select the AWS account and region.
- Authenticate the operator.
- Confirm the instance is online in Systems Manager.
- Create the GitHub OIDC role if CI invokes SSM.
- Restrict role permissions to the repository, environment, and instance.
- Choose SSM output retention.

Reference: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html

## 10. GitHub Actions and GHCR automation

The planned workflow is:

    commit
      -> install and check
      -> build API and web images
      -> publish SHA-tagged images to GHCR
      -> authenticate to AWS using OIDC
      -> invoke SSM
      -> deploy
      -> report health

Complete workflow files are not yet present in the repository.

Manual GitHub work will include package permissions, GHCR access for the EC2 host, GitHub environment variables, protected secrets where necessary, AWS OIDC trust, branch restrictions, and the first staging run.

Use OIDC instead of long-lived AWS access keys.

References:
- https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws
- https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images

## 11. Cloudinary automation

The API upload route automates multipart receipt, file validation, resizing, WebP conversion, server-side upload, and URL persistence.

Manual Cloudinary work includes creating the product environment, recording the cloud name and API key, protecting the API secret, configuring the folder, setting usage alerts, and testing upload failure behavior.

Persist Cloudinary public_id with the secure URL before relying on automated deletion or replacement. Cloudinary is not a database backup service.

Reference: https://cloudinary.com/documentation/node_image_and_video_upload

## 12. DNS and HTTPS automation

Caddy automates certificate handling after DNS resolves to the host and ports 80/443 are reachable.

Manual work includes registering the domain, creating DNS records, choosing proxy mode, verifying certificates, and updating DNS after host replacement. DNS is deliberately outside the current OpenTofu configuration.

## 13. Manual work on every release

The operator still reviews or approves:

- Release commit SHA
- OpenTofu plan and cost
- Database migration behavior
- Backup existence
- Production deployment approval
- Post-deploy health and critical order flows
- Rollback decision
- Recovery point during restoration

## 14. Automation still required

The next automation work is:

1. Add GitHub Actions for checks, image publishing, and SSM deployment.
2. Replace guessed EBS device detection with verified volume identity and UUID mounting.
3. Add encrypted off-instance backups, retention, and checksum verification.
4. Persist Cloudinary public_id and implement safe asset deletion.
5. Add deployment locking to prevent concurrent migrations.
6. Add disk, memory, backup-age, and billing alarms.
7. Add staging smoke checks and rollback tests.
8. Add a scoped private GHCR pull mechanism.
9. Schedule restore drills.

The repository now includes workflow templates under `.github/workflows/` for checks, image publishing, deployment, and rollback. They still require GitHub environment variables, AWS OIDC role configuration, GHCR access, and a verified host deployment command before the first run.

## 15. Readiness definition

Automation is complete when a new operator can clone the repository, initialize OpenTofu against the existing state bucket, recreate or replace the host, attach or restore the data volume without formatting it, restore runtime secrets, pull the chosen images, run one migration, start Compose, verify order flows, restore PostgreSQL from an off-instance backup, and roll back to the previous SHA.

Until those steps have been tested, this repository contains deployment building blocks rather than a fully proven hands-off production system.

