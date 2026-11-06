param([string]$MySqlDumpExecutable = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe')
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$settings = Get-Content -LiteralPath (Join-Path $root 'Backend/DentalCare.WebAPI/appsettings.Development.json') -Raw | ConvertFrom-Json
$connection = $env:ConnectionStrings__DefaultConnection
if (-not $connection) { $connection = $settings.ConnectionStrings.DefaultConnection }
$parts = @{}
$connection.Split(';') | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { $parts[$matches[1]] = $matches[2] } }
if ($parts['Database'] -ne 'cendekia_cms') { throw 'Only cendekia_cms may be backed up by this script.' }
$directory = Join-Path $root '.verify-cms/backups'
[void][System.IO.Directory]::CreateDirectory($directory)
$backupPath = Join-Path $directory ('cendekia_cms-' + (Get-Date -Format 'yyyyMMdd-HHmmssfff') + '.sql')
$process = New-Object System.Diagnostics.Process
$process.StartInfo.FileName = $MySqlDumpExecutable
$process.StartInfo.Arguments = "--host=$($parts['Server']) --port=$($parts['Port']) --user=$($parts['User ID']) --single-transaction --routines --triggers --no-tablespaces --default-character-set=utf8mb4 --result-file=`"$backupPath`" cendekia_cms"
$process.StartInfo.UseShellExecute = $false
$process.StartInfo.CreateNoWindow = $true
$process.StartInfo.RedirectStandardError = $true
$process.StartInfo.EnvironmentVariables['MYSQL_PWD'] = $parts['Password']
[void]$process.Start()
$errorText = $process.StandardError.ReadToEnd()
$process.WaitForExit()
if ($process.ExitCode -ne 0) { throw $errorText }
if ((Get-Item -LiteralPath $backupPath).Length -eq 0) { throw 'Database backup is empty.' }
Write-Output $backupPath
