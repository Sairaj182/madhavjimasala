#!/usr/bin/env bash
set -Eeuo pipefail

DATA_MOUNT="/mnt/data"
DATA_DEVICE_NAME="/dev/sdf"
if command -v dnf >/dev/null; then
  sudo dnf install -y docker xfsprogs
else
  sudo yum install -y docker xfsprogs
fi
command -v aws >/dev/null 2>&1 || { echo "AWS CLI (aws) is required on this AMI; install it before rerunning bootstrap" >&2; exit 1; }
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user || true
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE_VERSION="v5.7.0"
  case "$(uname -m)" in
    aarch64) COMPOSE_ARCH="aarch64"; COMPOSE_SHA256="15861535d14e26555736b49376c95e14bfd94285366c8446bfac7156a972e76f" ;;
    x86_64) COMPOSE_ARCH="x86_64"; COMPOSE_SHA256="7758048ad38e580f22559603312874fec8bb638d021a9e64182385fc17cc12a2" ;;
    *) echo "Unsupported Docker Compose architecture: $(uname -m)" >&2; exit 1 ;;
  esac
  COMPOSE_TMP="$(mktemp)"
  trap 'rm -f -- "$COMPOSE_TMP"' EXIT
  curl --fail --location --silent --show-error --retry 3 \
    "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-linux-$COMPOSE_ARCH" \
    --output "$COMPOSE_TMP"
  printf '%s  %s\n' "$COMPOSE_SHA256" "$COMPOSE_TMP" | sha256sum -c -
  sudo install -d -m 0755 /usr/local/lib/docker/cli-plugins
  sudo install -m 0755 "$COMPOSE_TMP" /usr/local/lib/docker/cli-plugins/docker-compose
  docker compose version
fi
sudo mkdir -p "$DATA_MOUNT" /opt/madhavji

IMDS_TOKEN="$(curl --fail --silent --connect-timeout 2 -X PUT -H 'X-aws-ec2-metadata-token-ttl-seconds: 21600' http://169.254.169.254/latest/api/token)"
metadata() {
  curl --fail --silent --connect-timeout 2 \
    -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
    "http://169.254.169.254/latest/meta-data/$1"
}
INSTANCE_ID="$(metadata instance-id)"
REGION="$(metadata placement/region)"
VOLUME_IDS=()
for attempt in $(seq 1 30); do
  VOLUME_OUTPUT="$(aws ec2 describe-volumes --region "$REGION" --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" "Name=attachment.device,Values=$DATA_DEVICE_NAME" --query 'Volumes[].VolumeId' --output text)" || { echo "Could not query attached EBS volumes" >&2; exit 1; }
  mapfile -t VOLUME_IDS < <(printf '%s\n' "$VOLUME_OUTPUT" | tr '\t' '\n' | sed '/^None$/d;/^$/d')
  [[ "${#VOLUME_IDS[@]}" -eq 1 ]] && break
  sleep 10
done
[[ "${#VOLUME_IDS[@]}" -eq 1 ]] || { echo "Expected exactly one /dev/sdf data volume" >&2; exit 1; }

VOLUME_ID="${VOLUME_IDS[0]}"
DEVICE=""
for candidate in "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_${VOLUME_ID/-/}" "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_${VOLUME_ID}" "/dev/disk/by-id/scsi-0Amazon_Elastic_Block_Store_${VOLUME_ID}"; do
  if [[ -e "$candidate" ]]; then DEVICE="$(readlink -f "$candidate")"; break; fi
done
[[ -n "$DEVICE" && -b "$DEVICE" ]] || { echo "Could not resolve EBS volume $VOLUME_ID" >&2; exit 1; }

if findmnt -M "$DATA_MOUNT" >/dev/null 2>&1; then
  MOUNTED_SOURCE="$(findmnt -M "$DATA_MOUNT" -no SOURCE)"
  [[ "$(readlink -f "$MOUNTED_SOURCE")" == "$DEVICE" ]] || { echo "Refusing to use $DATA_MOUNT: a different filesystem is mounted" >&2; exit 1; }
fi
FILESYSTEM_TYPE="$(sudo blkid -s TYPE -o value "$DEVICE" || true)"
if [[ -z "$FILESYSTEM_TYPE" ]]; then
  [[ "$(lsblk -nrpo NAME "$DEVICE" | wc -l)" -eq 1 ]] || { echo "Refusing to format a device with partitions" >&2; exit 1; }
  [[ -z "$(sudo wipefs -n "$DEVICE")" ]] || { echo "Refusing to format a device with existing signatures" >&2; exit 1; }
  [[ -z "$(findmnt -rn -S "$DEVICE" -o TARGET)" ]] || { echo "Refusing to format a mounted device" >&2; exit 1; }
  sudo mkfs -t xfs "$DEVICE"
  FILESYSTEM_TYPE="xfs"
fi
UUID="$(sudo blkid -s UUID -o value "$DEVICE")"
[[ -n "$UUID" ]] || { echo "No filesystem UUID on $DEVICE" >&2; exit 1; }
if awk -v mount="$DATA_MOUNT" '$2 == mount && $1 !~ /^#/ { found=1 } END { exit !found }' /etc/fstab; then
  grep -Fq "UUID=$UUID $DATA_MOUNT $FILESYSTEM_TYPE " /etc/fstab || { echo "Conflicting /etc/fstab entry for $DATA_MOUNT" >&2; exit 1; }
else
  echo "UUID=$UUID $DATA_MOUNT $FILESYSTEM_TYPE defaults,nofail 0 2" | sudo tee -a /etc/fstab >/dev/null
fi
if findmnt -M "$DATA_MOUNT" >/dev/null 2>&1; then
  [[ "$(findmnt -M "$DATA_MOUNT" -no UUID)" == "$UUID" ]] || { echo "Refusing to use $DATA_MOUNT: a different filesystem is mounted" >&2; exit 1; }
else
  sudo mount "$DATA_MOUNT"
fi
findmnt -M "$DATA_MOUNT" -no UUID | grep -Fxq "$UUID" || { echo "Data volume is not mounted at $DATA_MOUNT" >&2; exit 1; }
sudo mkdir -p "$DATA_MOUNT/postgres" "$DATA_MOUNT/redis"
sudo chown -R 999:999 "$DATA_MOUNT/postgres" "$DATA_MOUNT/redis"
