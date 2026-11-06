param([string]$MySqlExecutable = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe', [switch]$SpmbOnly, [switch]$SpmbDummy, [switch]$SocialOnly, [switch]$WebsiteSettingsOnly, [switch]$PrincipalOnly, [switch]$IdentityOnly, [switch]$ImagesOnly, [switch]$SpmbInformationOnly, [switch]$LmpOnly)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$settings = Get-Content -LiteralPath (Join-Path $projectRoot 'Backend/DentalCare.WebAPI/appsettings.Development.json') -Raw | ConvertFrom-Json
$connectionString = $env:ConnectionStrings__DefaultConnection
if (-not $connectionString) { $connectionString = $settings.ConnectionStrings.DefaultConnection }
$connectionParts = @{}
$connectionString.Split(';') | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { $connectionParts[$matches[1]] = $matches[2] } }
if ($connectionParts['Database'] -ne 'cendekia_cms') { throw 'Only the cendekia_cms database may be bootstrapped by this script.' }
$mysqlProcess = New-Object System.Diagnostics.Process
$mysqlProcess.StartInfo = New-Object System.Diagnostics.ProcessStartInfo
$mysqlProcess.StartInfo.FileName = $MySqlExecutable
$mysqlProcess.StartInfo.Arguments = "--host=$($connectionParts['Server']) --port=$($connectionParts['Port']) --user=$($connectionParts['User ID']) --default-character-set=utf8mb4"
$mysqlProcess.StartInfo.UseShellExecute = $false
$mysqlProcess.StartInfo.CreateNoWindow = $true
$mysqlProcess.StartInfo.RedirectStandardInput = $true
$mysqlProcess.StartInfo.RedirectStandardOutput = $true
$mysqlProcess.StartInfo.RedirectStandardError = $true
$mysqlProcess.StartInfo.EnvironmentVariables['MYSQL_PWD'] = $connectionParts['Password']
[void]$mysqlProcess.Start()
$schema = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/cendekia_cms.sql'))
$seed = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/seed_cendekia_content.sql'))
$spmb = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/spmb.sql'))
$sql = if ($SpmbOnly) { $spmb + "`nSELECT COUNT(*) AS waves FROM spmb_waves; SELECT COUNT(*) AS applications FROM spmb_applications;`n" } else { $schema + "`n" + $seed + "`n" + $spmb + "`nSELECT DATABASE(); SELECT Collection, COUNT(*) AS total FROM cendekia_cms.school_content GROUP BY Collection;`n" }
if ($SpmbDummy) { $sql = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/seed_spmb_dummy.sql')) }
$social = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/social_feeds.sql'))
if ($SocialOnly) { $sql = $social } elseif (-not $SpmbOnly -and -not $SpmbDummy) { $sql += "`n" + $social }
$websiteSettings = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/website_settings.sql'))
if ($WebsiteSettingsOnly) { $sql = $websiteSettings } elseif (-not $SpmbOnly -and -not $SpmbDummy -and -not $SocialOnly) { $sql += "`n" + $websiteSettings }
$principal = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/seed_principal_greeting.sql'))
if ($PrincipalOnly) { $sql = $principal } elseif (-not $SpmbOnly -and -not $SpmbDummy -and -not $SocialOnly -and -not $WebsiteSettingsOnly) { $sql += "`n" + $principal }
$identity = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/school_identity.sql'))
if ($IdentityOnly) { $sql = $identity } elseif (-not $SpmbOnly -and -not $SpmbDummy -and -not $SocialOnly -and -not $WebsiteSettingsOnly -and -not $PrincipalOnly) { $sql += "`n" + $identity }
$images = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/homepage_images.sql'))
if ($ImagesOnly) { $sql = $images } elseif (-not $SpmbOnly -and -not $SpmbDummy -and -not $SocialOnly -and -not $WebsiteSettingsOnly -and -not $PrincipalOnly -and -not $IdentityOnly) { $sql += "`n" + $images }
$spmbInformation = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/spmb_information.sql'))
if ($SpmbInformationOnly) { $sql = $spmbInformation } elseif (-not $SpmbOnly -and -not $SpmbDummy -and -not $SocialOnly -and -not $WebsiteSettingsOnly -and -not $PrincipalOnly -and -not $IdentityOnly -and -not $ImagesOnly) { $sql += "`n" + $spmbInformation }
$lmp = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/lmp.sql'))
if ($LmpOnly) { $sql = $lmp } elseif (-not $SpmbOnly -and -not $SpmbDummy -and -not $SocialOnly -and -not $WebsiteSettingsOnly -and -not $PrincipalOnly -and -not $IdentityOnly -and -not $ImagesOnly -and -not $SpmbInformationOnly) { $sql += "`n" + $lmp }
$sqlBytes = [System.Text.Encoding]::UTF8.GetBytes($sql)
$mysqlProcess.StandardInput.BaseStream.Write($sqlBytes, 0, $sqlBytes.Length)
$mysqlProcess.StandardInput.Close()
$mysqlOutput = $mysqlProcess.StandardOutput.ReadToEnd()
$mysqlError = $mysqlProcess.StandardError.ReadToEnd()
$mysqlProcess.WaitForExit()
if ($mysqlProcess.ExitCode -ne 0) { throw $mysqlError }
Write-Output $mysqlOutput
