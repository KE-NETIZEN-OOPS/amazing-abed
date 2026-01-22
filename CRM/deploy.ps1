# Deployment Script for Vercel
Write-Host "=== CRM System Deployment to Vercel ===" -ForegroundColor Green
Write-Host ""

# Check if vercel is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "Step 1: Setting up GitHub repository" -ForegroundColor Cyan
Write-Host "You need to create a new GitHub repository first." -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Create new repo on GitHub.com, then run:" -ForegroundColor White
Write-Host "  git remote remove origin" -ForegroundColor Gray
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Gray
Write-Host "  git push -u origin master" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Deploy directly to Vercel (recommended)" -ForegroundColor White
Write-Host "  This will create a GitHub repo automatically" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Do you want to deploy to Vercel now? (y/n)"

if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host ""
    Write-Host "Deploying to Vercel..." -ForegroundColor Green
    Write-Host "Follow the prompts:" -ForegroundColor Yellow
    Write-Host "  - Login to Vercel (if not already)" -ForegroundColor Gray
    Write-Host "  - Link to existing project? No" -ForegroundColor Gray
    Write-Host "  - Project name? (Press Enter for default)" -ForegroundColor Gray
    Write-Host "  - Directory? (Press Enter for current)" -ForegroundColor Gray
    Write-Host ""
    
    vercel
    
    Write-Host ""
    Write-Host "For production deployment, run: vercel --prod" -ForegroundColor Cyan
} else {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
}
