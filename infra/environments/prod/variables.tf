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
  default = "t3.small"
}

variable "subnet_id" {
  type        = string
  default     = null
  description = "Optional public subnet in the default VPC; pin this to select an Availability Zone with EC2 capacity"
}

variable "ami_id" {
  type        = string
  description = "Amazon Linux 2023 AMI matching the instance architecture in the selected region"
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
