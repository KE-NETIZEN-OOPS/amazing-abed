#!/bin/bash

# SERVER-SIDE Deployment script for TYTOS Monitoring API v2.5.46
# Run this ON YOUR SERVER after pulling the Docker image

echo "============================================================"
echo "🚀 TYTOS Monitoring API Deployment - v2.5.46"
echo "============================================================"
echo ""
echo "✅ FIXED: Portfolio/Follower Wallets Page"
echo "   - Fixed win/loss calculation (was using non-existent exit_price)"
echo "   - Now correctly uses: sold_amount > amount for wins"
echo "   - Wallets will now display proper trading statistics"
echo ""

# Stop and remove existing monitoring containers
echo "🛑 Stopping existing monitoring containers..."
docker stop tytos-monitoring 2>/dev/null || true
docker stop tytos-monitoring-api 2>/dev/null || true
docker rm tytos-monitoring 2>/dev/null || true
docker rm tytos-monitoring-api 2>/dev/null || true

echo "✅ Old containers removed"
echo ""

# Pull the latest image
echo "📥 Pulling v2.5.46 image..."
docker pull ghcr.io/ke-netizen-oops/tytos-monitoring:v2.5.46

echo ""
echo "🚀 Starting monitoring API container..."
echo ""

# Run the new container
docker run -d \
  --name tytos-monitoring \
  --restart unless-stopped \
  -p 8081:8081 \
  -e DATABASE_URL="postgresql://tytos_user:tytos_password@tytos-postgres:5432/tytos_trading_bot" \
  --network tytos-network \
  ghcr.io/ke-netizen-oops/tytos-monitoring:v2.5.46

echo ""
echo "⏳ Waiting for API to start..."
sleep 5

# Check if container is running
if docker ps | grep -q tytos-monitoring; then
    echo ""
    echo "============================================================"
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "============================================================"
    echo ""
    echo "📊 Monitoring API Status:"
    docker ps | grep tytos-monitoring
    echo ""
    echo "🌐 API Endpoint: http://134.199.211.155:8081"
    echo ""
    echo "🧪 Test the Portfolio fix:"
    echo "   curl http://134.199.211.155:8081/api/follower-wallets | python3 -m json.tool"
    echo ""
    echo "Expected results:"
    echo "   ✅ Follower wallets will display"
    echo "   ✅ Win/loss stats calculated correctly"
    echo "   ✅ Win rate based on: sold_amount > amount"
    echo ""
    echo "🔄 Refresh your frontend to see follower wallets!"
    echo ""
    echo "============================================================"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo ""
    echo "📋 Container logs:"
    docker logs tytos-monitoring
    echo ""
    echo "============================================================"
fi

