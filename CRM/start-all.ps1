# Start all services
Write-Host "Starting Amazing Abed services..." -ForegroundColor Cyan

# Start API in new window
Start-Process powershell -ArgumentList "-NoExit", "-File", "start-api.ps1"

# Start Web in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; npm run dev"

# Start Worker in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\worker; `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/amazing_abed'; `$env:REDIS_HOST='localhost'; `$env:REDIS_PORT='6379'; npm run dev"

Write-Host "All services starting in separate windows..." -ForegroundColor Green
Write-Host "API: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Web: http://localhost:3000" -ForegroundColor Yellow
