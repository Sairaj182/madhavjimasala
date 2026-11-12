[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^i-[0-9a-f]+$')]
  [string]$InstanceId,

  [string]$Region = "ap-south-1",

  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Files = @(
  @{ Source = "deploy/compose.production.yml"; Target = "compose.production.yml"; Mode = "0644" },
  @{ Source = "deploy/Caddyfile"; Target = "Caddyfile"; Mode = "0644" },
  @{ Source = "deploy/.env.production.example"; Target = ".env.production.example"; Mode = "0644" },
  @{ Source = "scripts/deploy.sh"; Target = "scripts/deploy.sh"; Mode = "0755" },
  @{ Source = "scripts/backup.sh"; Target = "scripts/backup.sh"; Mode = "0755" },
  @{ Source = "scripts/restore.sh"; Target = "scripts/restore.sh"; Mode = "0755" },
  @{ Source = "scripts/health.sh"; Target = "scripts/health.sh"; Mode = "0755" }
)

$Transfers = [System.Collections.Generic.List[object]]::new()
foreach ($File in $Files) {
  $SourcePath = Join-Path $RepositoryRoot $File.Source
  if (-not (Test-Path -LiteralPath $SourcePath)) { throw "Missing source file: $SourcePath" }
  $Encoded = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($SourcePath))
  $Target = "/opt/madhavji/$($File.Target)"
  $Temporary = "$Target.stage"
  $Transfers.Add("set -Eeuo pipefail; install -d -m 0755 /opt/madhavji/scripts; : > $Temporary")
  for ($Offset = 0; $Offset -lt $Encoded.Length; $Offset += 2400) {
    $Length = [Math]::Min(2400, $Encoded.Length - $Offset)
    $Chunk = $Encoded.Substring($Offset, $Length)
    $Transfers.Add("set -Eeuo pipefail; printf '%s' '$Chunk' >> $Temporary")
  }
  $Transfers.Add("set -Eeuo pipefail; base64 --decode $Temporary > $Temporary.decoded; chmod $($File.Mode) $Temporary.decoded; mv -f $Temporary.decoded $Target; rm -f $Temporary")
}

if ($DryRun) {
  Write-Output "Dry run: would stage $($Files.Count) non-secret files in $($Transfers.Count) small SSM commands on $InstanceId in $Region. No AWS command sent."
  return
}

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { throw "AWS CLI is required." }
$Step = 0
foreach ($Transfer in $Transfers) {
  $Step++
  if ($Transfer.Length -gt 3500) { throw "Staging command $Step is too large." }
  $Request = @{
    DocumentName = "AWS-RunShellScript"
    InstanceIds = @($InstanceId)
    Comment = "Stage Madhavji files step $Step of $($Transfers.Count)"
    Parameters = @{ commands = @($Transfer) }
  } | ConvertTo-Json -Depth 5 -Compress
  $RequestPath = Join-Path $PSScriptRoot (".ssm-stage-request-" + [guid]::NewGuid().ToString("N") + ".json")
  try {
    [System.IO.File]::WriteAllText($RequestPath, $Request, [System.Text.UTF8Encoding]::new($false))
    $RequestUri = "file://" + $RequestPath.Replace('\', '/')
    $CommandId = aws ssm send-command --region $Region --cli-input-json $RequestUri --query "Command.CommandId" --output text --no-cli-pager
    $SendExitCode = $LASTEXITCODE
  } finally {
    if (Test-Path -LiteralPath $RequestPath) { Remove-Item -LiteralPath $RequestPath -Force }
  }
  if ($SendExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($CommandId)) { throw "Staging step $Step submission failed; check AWS CLI output." }
  aws ssm wait command-executed --region $Region --command-id $CommandId --instance-id $InstanceId --no-cli-pager
  if ($LASTEXITCODE -ne 0) { throw "Staging step $Step failed or timed out. Inspect SSM command $CommandId. Do not start the stack yet." }
  Write-Output "Staging step $Step/$($Transfers.Count) succeeded"
}
Write-Output "Deployment files staged under /opt/madhavji on $InstanceId."
