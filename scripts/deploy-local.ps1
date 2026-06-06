param(
  [string]$HostName = "server1.star-lemon.top",
  [string]$User = "root",
  [string]$IdentityFile = "$HOME\.ssh\id_ed25519",
  [string]$RemoteDir = "/opt/star-lemon",
  [string]$Container = "star-lemon",
  [switch]$Clean
)

$ErrorActionPreference = "Stop"

function Quote-Sh([string]$Value) {
  return "'" + ($Value -replace "'", "'\''") + "'"
}

$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
  throw "Could not find git repository root."
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$archive = Join-Path ([System.IO.Path]::GetTempPath()) "star-lemon-source-$timestamp.tar.gz"
$remoteArchive = "/tmp/star-lemon-source-$timestamp.tar.gz"
$target = "$User@$HostName"

$excludeArgs = @(
  "--exclude=.git",
  "--exclude=node_modules",
  "--exclude=.next",
  "--exclude=.env",
  "--exclude=.env.*",
  "--exclude=.idea",
  "--exclude=tsconfig.tsbuildinfo",
  "--exclude=*.zip"
)

Write-Host "Packaging source from $repoRoot"
& tar -czf $archive @excludeArgs -C $repoRoot .

$archiveInfo = Get-Item $archive
Write-Host ("Archive size: {0:N2} MB" -f ($archiveInfo.Length / 1MB))

$sshArgs = @()
if ($IdentityFile) {
  $sshArgs += @("-i", $IdentityFile)
}
$sshArgs += @("-o", "IdentitiesOnly=yes")

Write-Host "Uploading archive to ${target}:$remoteArchive"
& scp @sshArgs $archive "${target}:$remoteArchive"

$cleanCommand = ""
if ($Clean) {
  $cleanCommand = @"
find $(Quote-Sh $RemoteDir) -mindepth 1 -maxdepth 1 \
  ! -name '.env' \
  ! -name '.env.local' \
  ! -name 'node_modules' \
  ! -name '.user.ini' \
  -exec rm -rf {} +
"@
}

$remoteCommand = @"
set -e
mkdir -p $(Quote-Sh $RemoteDir)
$cleanCommand
tar -xzf $(Quote-Sh $remoteArchive) -C $(Quote-Sh $RemoteDir)
rm -f $(Quote-Sh $remoteArchive)
docker restart $(Quote-Sh $Container)
"@

Write-Host "Extracting source and restarting $Container"
$remoteCommand | & ssh @sshArgs $target "bash -s"

Remove-Item $archive -Force
Write-Host "Deploy complete."
