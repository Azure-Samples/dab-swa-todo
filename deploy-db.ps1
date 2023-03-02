$envFile = ".\.env"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#].+?)\s*=\s*(.+?)\s*$') {
      $varName = $matches[1]
      $varValue = $matches[2] -replace '"'            
      $varValue = $varValue -replace "'"            
      Set-Item -Path "Env:$varName" -Value "$varValue"
    }
  }
}

$curDir = Get-Location
Set-Location ".\database\TodoDB\"

Write-Host "Building .dacpac..."
dotnet build -c Release         

Write-Host "Deploying .dacpac..."
sqlpackage /a:Publish -sf:./bin/Release/TodoDB.dacpac -tcs:$env:AZURE_SQL_DEPLOY_USER /p:DropObjectsNotInSource=false

Set-Location $curDir
Write-Host "Done."
