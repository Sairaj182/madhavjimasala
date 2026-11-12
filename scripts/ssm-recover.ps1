[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^i-[0-9a-f]+$')]
  [string]$InstanceId,

  [string]$Region = "ap-south-1",

  [ValidatePattern('^[0-9a-fA-F-]{36}$')]
  [string]$CommandId,

  [switch]$DryRun,

  [switch]$Wait
)

$ErrorActionPreference = "Stop"
if ($CommandId -and $DryRun) { throw "Use -CommandId to resume polling, or -DryRun to preview a new command." }
if ($CommandId) { $Wait = $true }

if (-not (Get-Command aws -ErrorAction SilentlyContinue) -and -not $DryRun) {
  throw "AWS CLI is required. Configure authentication in your local AWS CLI/SSO profile before running this script."
}

if (-not $CommandId) {
  $BootstrapPath = Join-Path $PSScriptRoot "ec2-bootstrap.sh"
  if (-not (Test-Path -LiteralPath $BootstrapPath)) {
    throw "Bootstrap script not found: $BootstrapPath"
  }
  $Bootstrap = Get-Content -LiteralPath $BootstrapPath -Raw
  $EncodedBootstrap = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Bootstrap))
  $RecoveryScript = "printf '%s' '$EncodedBootstrap' | base64 --decode | bash"
  $Request = @{
    DocumentName = "AWS-RunShellScript"
    InstanceIds = @($InstanceId)
    Comment = "Madhavji safe EBS and Docker recovery"
    Parameters = @{ commands = @($RecoveryScript) }
  } | ConvertTo-Json -Depth 5 -Compress
  $ParsedRequest = $Request | ConvertFrom-Json
  if ($ParsedRequest.InstanceIds[0] -ne $InstanceId -or $ParsedRequest.Parameters.commands.Count -ne 1) {
    throw "SSM request validation failed."
  }
}

if ($DryRun) {
  Write-Output "Dry run: would send current ec2-bootstrap.sh to $InstanceId in $Region via AWS-RunShellScript."
  Write-Output "Payload bytes: $([Text.Encoding]::UTF8.GetByteCount($Bootstrap)); JSON request validated; no AWS command sent."
  return
}

if (-not $CommandId) {
  $RequestPath = Join-Path $PSScriptRoot (".ssm-recover-request-" + [guid]::NewGuid().ToString("N") + ".json")
  try {
    [System.IO.File]::WriteAllText($RequestPath, $Request, [System.Text.UTF8Encoding]::new($false))
    $RequestUri = "file://" + $RequestPath.Replace('\', '/')
    $CommandId = aws ssm send-command `
      --region $Region `
      --cli-input-json $RequestUri `
      --query "Command.CommandId" `
      --output text
    $SendExitCode = $LASTEXITCODE
  } finally {
    if (Test-Path -LiteralPath $RequestPath) { Remove-Item -LiteralPath $RequestPath -Force }
  }

  if ($SendExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($CommandId)) {
    throw "SSM command submission failed. Check the AWS CLI error above."
  }
  Write-Output "Submitted SSM recovery command: $CommandId"
} else {
  Write-Output "Resuming SSM recovery command: $CommandId"
}

if ($Wait) {
  $Invocation = $null
  $Attempts = 0
  $FailedPolls = 0
  do {
    Start-Sleep -Seconds 5
    $Attempts++
    $PreviousAwsOutputEncoding = $env:AWS_CLI_OUTPUT_ENCODING
    try {
      $ErrorActionPreference = "Continue"
      $env:AWS_CLI_OUTPUT_ENCODING = "UTF-8"
      $Response = @(aws ssm get-command-invocation `
        --region $Region `
        --command-id $CommandId `
        --instance-id $InstanceId `
        --output json `
        --no-cli-pager 2>&1)
      $QueryExitCode = $LASTEXITCODE
    } finally {
      $env:AWS_CLI_OUTPUT_ENCODING = $PreviousAwsOutputEncoding
      $ErrorActionPreference = "Stop"
    }
    if ($QueryExitCode -eq 0 -and $Response.Count -gt 0) {
      $FailedPolls = 0
      $Invocation = ($Response -join "`n") | ConvertFrom-Json
    } else {
      $AwsError = ($Response | ForEach-Object { $_.ToString() }) -join "`n"
      if ($AwsError -notmatch 'InvocationDoesNotExist|Throttling|RequestLimitExceeded') {
        throw "AWS CLI could not read SSM command $CommandId (exit $QueryExitCode): $AwsError"
      }
      $FailedPolls++
      if ($FailedPolls -ge 12) { throw "SSM command $CommandId has no readable invocation after 12 attempts. Last AWS error: $AwsError. Inspect it with aws ssm list-commands --command-id $CommandId --region $Region." }
    }
    if ($Attempts -ge 240) { throw "Timed out waiting for SSM command $CommandId; inspect it in Systems Manager." }
  } while ($null -eq $Invocation -or $Invocation.Status -in @("Pending", "InProgress", "Delayed"))

  if ($Invocation.StandardOutputContent) { Write-Output $Invocation.StandardOutputContent }
  if ($Invocation.StandardErrorContent) { Write-Output $Invocation.StandardErrorContent }
  if ($Invocation.Status -ne "Success") { throw "SSM recovery finished with status: $($Invocation.Status)" }
}
