#!/bin/bash

# Deploy to server script
echo "🚀 Deploying Amazing Abed to server..."

# SSH to server and create directory
ssh boss-server "mkdir -p amazing-abed && cd amazing-abed && git clone https://github.com/KE-NETIZEN-OOPS/amazing-abed.git . || git pull"

# Copy files to server
scp -r . boss-server:~/amazing-abed/

# SSH and run docker
ssh boss-server "cd amazing-abed && docker-compose down && docker-compose build && docker-compose up -d"

echo "✅ Deployment complete!"
