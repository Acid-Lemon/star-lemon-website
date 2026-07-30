param(
  [string]$HostName = "server1.star-lemon.top",
  [string]$User = "root",
  [string]$IdentityFile = "$HOME\.ssh\id_ed25519",
  [string]$RemoteDir = "/opt/star-lemon",
  [string]$PanelApiKey = "zKDVR2upS9hEu5rxHOObb6x1oJYVMtpa",
  [string]$RuntimeApiUrl = "https://server1.star-lemon.top/api/v2/runtimes/operate",
  [int]$RuntimeId = 1,
  [string]$LogsApiUrl = "https://server1.star-lemon.top/api/v2/containers/search/log?compose=/opt/1panel/runtime/node/star-lemon/docker-compose.yml&since=all&tail=100&follow=true&timestamp=false&operateNode=local",
  [switch]$Clean
)

$ErrorActionPreference = "Stop"

$localConfig = Join-Path $PSScriptRoot "deploy-local.local.ps1"
if (-not $PanelApiKey -and (Test-Path $localConfig)) {
  . $localConfig
}

if (-not $PanelApiKey) {
  throw "Missing 1Panel API key. Set ONEPANEL_API_KEY or create scripts\deploy-local.local.ps1 with `$PanelApiKey = 'your-api-key'."
}

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
$runtimePayload = '{"operate":"restart","ID":' + $RuntimeId + '}'

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
Remove-Item $archive -Force

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

PANEL_TIMESTAMP=`$(date +%s)
PANEL_TOKEN=`$(printf '1panel%s%s' $(Quote-Sh $PanelApiKey) "`$PANEL_TIMESTAMP" | md5sum | awk '{print `$1}')
AUTH_ARGS=(-H "1Panel-Token: `$PANEL_TOKEN" -H "1Panel-Timestamp: `$PANEL_TIMESTAMP")

mkdir -p $(Quote-Sh $RemoteDir)
$cleanCommand
tar -xzf $(Quote-Sh $remoteArchive) -C $(Quote-Sh $RemoteDir)
rm -f $(Quote-Sh $remoteArchive)
curl -fsS "`$`{AUTH_ARGS[@]}" -X POST $(Quote-Sh $RuntimeApiUrl) -H 'Content-Type: application/json' --data $(Quote-Sh $runtimePayload)
echo
echo 'Streaming runtime logs. Press Ctrl+C to stop.'
curl -sS -N "`$`{AUTH_ARGS[@]}" -H 'Accept: text/event-stream' $(Quote-Sh $LogsApiUrl)
"@

Write-Host "Extracting source and restarting runtime $RuntimeId"
$remoteScript = Join-Path ([System.IO.Path]::GetTempPath()) "star-lemon-remote-$timestamp.sh"
[System.IO.File]::WriteAllText($remoteScript, $remoteCommand, [System.Text.UTF8Encoding]::new($false))
$identityArg = if ($IdentityFile) { "-i `"$IdentityFile`"" } else { "" }
$sshCommand = "ssh $identityArg -o IdentitiesOnly=yes $target `"bash -s`""
& cmd.exe /c "type `"$remoteScript`" | $sshCommand"
$sshExitCode = $LASTEXITCODE
Remove-Item $remoteScript -Force
if ($sshExitCode -ne 0) {
  exit $sshExitCode
}

Write-Host "Deploy complete."
