Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Create-LinuxCompatibleZip {
    param(
        [Parameter(Mandatory=$true)][string]$SourceDir,
        [Parameter(Mandatory=$true)][string]$ZipPath,
        [string]$Prefix = ""
    )

    if (Test-Path $ZipPath) {
        Remove-Item $ZipPath -Force
    }

    $sourceResolved = (Resolve-Path $SourceDir).Path
    $files = Get-ChildItem -Path $sourceResolved -Recurse -File

    $archive = [System.IO.Compression.ZipFile]::Open($ZipPath, [System.IO.Compression.ZipArchiveMode]::Create)

    foreach ($file in $files) {
        $relPath = $file.FullName.Substring($sourceResolved.Length).TrimStart('\', '/')
        $entryName = ($Prefix + $relPath) -replace '\\', '/'
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }

    $archive.Dispose()
    Write-Host "Created $ZipPath ($($files.Count) files) with Linux forward slashes."
}

Write-Host "Packaging Backend Archives..."
# 1. Package backend with 'dist/' prefix (for uploading into 'nodejs' root folder)
Create-LinuxCompatibleZip -SourceDir "backend/dist" -ZipPath "backend-hpanel.zip" -Prefix "dist/"
Copy-Item "backend-hpanel.zip" "api.foodybhai.in.zip" -Force
Copy-Item "backend-hpanel.zip" "backend-build.zip" -Force

# 2. Package backend without 'dist/' prefix (in case user extracts inside 'dist/' folder)
Create-LinuxCompatibleZip -SourceDir "backend/dist" -ZipPath "backend-dist-only.zip" -Prefix ""

Write-Host "Packaging Frontend Archives..."
# 3. Package frontend (browser output)
Create-LinuxCompatibleZip -SourceDir "frontend/dist/foody-bhai/browser" -ZipPath "frontend-build.zip" -Prefix ""
Copy-Item "frontend-build.zip" "website-build.zip" -Force

Write-Host "Packaging Admin App Archives..."
# 4. Package admin-app (browser output)
Create-LinuxCompatibleZip -SourceDir "admin-app/dist/admin-app/browser" -ZipPath "admin-build.zip" -Prefix ""
Copy-Item "admin-build.zip" "admin-app-build.zip" -Force

Write-Host "ALL DEPLOYMENT ARCHIVES PACKAGED SUCCESSFULLY!"
