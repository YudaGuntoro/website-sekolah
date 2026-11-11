param([string]$MySqlExecutable = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe', [switch]$SpmbOnly, [switch]$SpmbDummy, [switch]$SocialOnly, [switch]$WebsiteSettingsOnly, [switch]$PrincipalOnly, [switch]$IdentityOnly, [switch]$ImagesOnly, [switch]$SpmbInformationOnly, [switch]$LmpOnly, [switch]$NormalizeOnly, [switch]$SecurityOnly)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$connectionString = $env:ConnectionStrings__DefaultConnection
if (-not $connectionString) {
    $settings = Get-Content -LiteralPath (Join-Path $projectRoot 'Backend/Cendekia.WebAPI/appsettings.Development.json') -Raw | ConvertFrom-Json
    $connectionString = $settings.ConnectionStrings.DefaultConnection
}
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
$normalization = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261106_school_normalization.sql')) + "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261106_registration_relations.sql'))
# Once migrated, legacy JSON seeds must not run against the relational tables.
$check = New-Object System.Diagnostics.Process
$check.StartInfo.FileName = $MySqlExecutable
$check.StartInfo.Arguments = $mysqlProcess.StartInfo.Arguments + ' --batch --skip-column-names'
$check.StartInfo.UseShellExecute = $false
$check.StartInfo.CreateNoWindow = $true
$check.StartInfo.RedirectStandardInput = $true
$check.StartInfo.RedirectStandardOutput = $true
$check.StartInfo.RedirectStandardError = $true
$check.StartInfo.EnvironmentVariables['MYSQL_PWD'] = $connectionParts['Password']
[void]$check.Start()
$check.StandardInput.WriteLine("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='cendekia_cms' AND TABLE_NAME='schema_migrations'; SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND ((TABLE_NAME IN('lmp_settings','spmb_information','school_identity') AND COLUMN_NAME IN('ConfigJson','MissionsJson')) OR (TABLE_NAME='spmb_applications' AND COLUMN_NAME='WaveStartDate') OR (TABLE_NAME='lmp_applications' AND COLUMN_NAME='EventTitle'));")
$check.StandardInput.Close()
$checkValues = $check.StandardOutput.ReadToEnd().Trim() -split '\s+'
$hasMigrationTable = $checkValues[0] -eq '1'
$checkError = $check.StandardError.ReadToEnd()
$check.WaitForExit()
if ($check.ExitCode -ne 0) { throw $checkError }
if ([int]$checkValues[1] -gt 0) {
    # Back up an existing legacy database before any columns are replaced.
    & (Join-Path $PSScriptRoot 'Backup-LocalDatabase.ps1')
}
if ($NormalizeOnly -or $hasMigrationTable) {
    $sql = $normalization
    if ($SpmbDummy) { $sql = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/seed_spmb_dummy.sql')) }
    if ($PrincipalOnly) { $sql = $principal }
} else { $sql += "`n" + $normalization }
$sessionSchema = [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/auth_sessions.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261107_spmb_wave_groups.sql'))
if ($SecurityOnly) { $sql = $sessionSchema } else { $sql += "`n" + $sessionSchema }
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261108_registration_payment_proofs.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261109_lmp_information_steps.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261109_spmb_application_documents.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261109_spmb_document_notes.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261109_spmb_applicant_profiles.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261109_school_content_images.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261110_spmb_payment_status.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261110_lmp_nisn.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261110_extracurricular_coach.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261110_school_highlights.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261110_homepage_image_files.sql'))
$sql += "`n" + [System.IO.File]::ReadAllText((Join-Path $projectRoot 'database/migrations/20261111_homepage_spmb_image.sql'))
$sqlBytes = [System.Text.Encoding]::UTF8.GetBytes($sql)
$mysqlProcess.StandardInput.BaseStream.Write($sqlBytes, 0, $sqlBytes.Length)
$mysqlProcess.StandardInput.Close()
$mysqlOutput = $mysqlProcess.StandardOutput.ReadToEnd()
$mysqlError = $mysqlProcess.StandardError.ReadToEnd()
$mysqlProcess.WaitForExit()
if ($mysqlProcess.ExitCode -ne 0) { throw $mysqlError }
Write-Output $mysqlOutput
