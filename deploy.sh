#!/bin/bash

# Configuration
APP_NAME="ced-webapp"

echo "🚀 Starting Deployment for $APP_NAME..."

# Pull latest changes (assuming git is set up)
# git pull origin main

# Build and Start Containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Clean up prune unused images to save space
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
echo "📡 App is running at port 3006"
