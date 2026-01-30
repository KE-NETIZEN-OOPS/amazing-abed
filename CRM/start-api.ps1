# Start API Server
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amazing_abed"
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:PORT="3001"
cd apps\api
node dist\apps\api\src\main.js
