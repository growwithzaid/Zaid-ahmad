$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root 'dist'
if (Test-Path -LiteralPath $dist) { Remove-Item -LiteralPath $dist -Recurse -Force }
New-Item -ItemType Directory -Path $dist | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'index.html') -Destination $dist
Copy-Item -LiteralPath (Join-Path $root '404.html') -Destination $dist
Copy-Item -LiteralPath (Join-Path $root 'development') -Destination $dist -Recurse
Copy-Item -LiteralPath (Join-Path $root 'seo') -Destination $dist -Recurse
$outAssets = Join-Path $dist 'assets'
New-Item -ItemType Directory -Path $outAssets | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'assets\site.css') -Destination $outAssets
Copy-Item -LiteralPath (Join-Path $root 'assets\site.js') -Destination $outAssets
Copy-Item -LiteralPath (Join-Path $root 'assets\config.js') -Destination $outAssets
Copy-Item -LiteralPath (Join-Path $root 'assets\favicon.svg') -Destination $outAssets
$cv = Join-Path $outAssets 'cv'; New-Item -ItemType Directory -Path $cv | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'assets\cv\Zaid-Ahmad-CV.pdf') -Destination $cv
$memes = Join-Path $outAssets 'memes'; New-Item -ItemType Directory -Path $memes | Out-Null
foreach ($file in @('cursor-cat-closed.png','cursor-cat-open.png','developer-1.jpg','developer-2.jpg','developer-3.jpg','hero-meme.png','seo-2.jpg','seo-3.jpg','student-1.jpg','student-2.jpg')) { Copy-Item -LiteralPath (Join-Path $root "assets\memes\$file") -Destination $memes }
$sold = Join-Path $outAssets 'sold'; New-Item -ItemType Directory -Path $sold | Out-Null
foreach ($file in @('sold-cover.png','sold-homepage.png','sold-product.png')) { Copy-Item -LiteralPath (Join-Path $root "assets\sold\$file") -Destination $sold }
Copy-Item -LiteralPath (Join-Path $root 'robots.txt') -Destination $dist
Copy-Item -LiteralPath (Join-Path $root 'sitemap.xml') -Destination $dist
Write-Host "Static site built at $dist"
