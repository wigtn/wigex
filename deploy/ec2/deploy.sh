#!/bin/bash
# ===========================================
# Travel Helper - EC2 Deployment Script
# ===========================================
set -e

DEPLOY_DIR="/opt/travel-helper"
BACKUP_DIR="$DEPLOY_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$DEPLOY_DIR/logs/deploy_$DATE.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Travel Helper Deployment ==="
log "Date: $DATE"

cd $DEPLOY_DIR

# Check if .env exists
if [ ! -f .env ]; then
    log "ERROR: .env file not found. Copy from .env.template and configure."
    exit 1
fi

# Source environment variables
source .env

# Check required variables
if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "CHANGE_ME_STRONG_PASSWORD" ]; then
    log "ERROR: POSTGRES_PASSWORD not set or still default. Please update .env"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [[ "$JWT_SECRET" == *"CHANGE_ME"* ]]; then
    log "ERROR: JWT_SECRET not set or still default. Please update .env"
    exit 1
fi

# Backup database before deployment
log "Creating database backup..."
if docker ps | grep -q travel-helper-db; then
    docker exec travel-helper-db pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_DIR/db_backup_$DATE.sql 2>/dev/null || log "Warning: Could not backup database (might be first deployment)"
fi

# Login to GitHub Container Registry if credentials provided
if [ -n "$GITHUB_TOKEN" ]; then
    log "Logging into GitHub Container Registry..."
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin
fi

# Pull latest images
log "Pulling latest images..."
docker compose -f docker-compose.ec2.yml pull

# Rolling update - API first
log "Starting rolling update..."
log "Updating API service..."
docker compose -f docker-compose.ec2.yml up -d --no-deps api
sleep 15

# Health check for API
log "Checking API health..."
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec travel-helper-api wget -q --spider http://localhost:3000/api/health 2>/dev/null; then
        log "API is healthy!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log "Waiting for API... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log "ERROR: API health check failed after $MAX_RETRIES attempts"
    log "Rolling back..."
    docker compose -f docker-compose.ec2.yml down
    docker compose -f docker-compose.ec2.yml up -d
    exit 1
fi

# Update other services
log "Updating AI service..."
docker compose -f docker-compose.ec2.yml up -d --no-deps ai-service

log "Updating Admin dashboard..."
docker compose -f docker-compose.ec2.yml up -d --no-deps admin

log "Updating Nginx..."
docker compose -f docker-compose.ec2.yml up -d --no-deps nginx

# Cleanup old images
log "Cleaning up old images..."
docker image prune -af --filter "until=24h" 2>/dev/null || true

# Keep only last 5 backups
log "Cleaning old backups..."
ls -t $BACKUP_DIR/db_backup_*.sql 2>/dev/null | tail -n +6 | xargs -r rm || true

log "=== Deployment Complete ==="
log ""
log "Service status:"
docker compose -f docker-compose.ec2.yml ps

log ""
log "To view logs: docker compose -f docker-compose.ec2.yml logs -f [service]"
log "Log file saved to: $LOG_FILE"
