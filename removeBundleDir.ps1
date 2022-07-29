$bundlePath = './lib';

if (Test-Path -Path $bundlePath) {
  Remove-Item -Path $bundlePath -Recurse;
  Write-Host "Bundle folder was removed" -fore green
}