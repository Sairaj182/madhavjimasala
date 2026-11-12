output "instance_id" {
  value = aws_instance.app.id
}

output "public_ip" {
  value = aws_eip.app.public_ip
}

output "elastic_ip_allocation_id" {
  value = aws_eip.app.id
}

output "data_volume_id" {
  value = aws_ebs_volume.data.id
}

output "ssm_console" {
  value = "https://${var.region}.console.aws.amazon.com/systems-manager/managed-nodes/${aws_instance.app.id}/?region=${var.region}"
}
