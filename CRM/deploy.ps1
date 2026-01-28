# PowerShell deployment script
Write-Host "🚀 Deploying Amazing Abed to server..." -ForegroundColor Cyan

# SSH to server and setup
ssh boss-server "mkdir -p amazing-abed; cd amazing-abed; git clone https://github.com/KE-NETIZEN-OOPS/amazing-abed.git . 2>&1 | Out-Null; git pull 2>&1 | Out-Null"

# Build and deploy
ssh boss-server "cd amazing-abed; docker-compose down; docker-compose build; docker-compose up -d"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
