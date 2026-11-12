variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "instance_type" {
  type    = string
  default = "t4g.small"
}

variable "ami_id" {
  type        = string
  description = "ARM64 Amazon Linux 2023 AMI in the selected region"
}

variable "data_volume_gb" {
  type    = number
  default = 50
}

variable "backup_bucket_arn" {
  type        = string
  default     = null
  description = "Optional S3 bucket ARN for encrypted PostgreSQL backup uploads"
  nullable    = true
}
