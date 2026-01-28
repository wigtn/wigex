#!/bin/bash
# ===========================================
# Travel Helper - SSL Certificate Renewal
# Add to crontab: 0 3 * * * /opt/travel-helper/renew-ssl.sh
# ===========================================

DEPLOY_DIR="/opt/travel-helper"
LOG_FILE="$DEPLOY_DIR/logs/ssl-renew.log"

echo "[$(date)] Starting SSL renewal check..." >> $LOG_FILE

cd $DEPLOY_DIR

# Run certbot renewal
docker compose -f docker-compose.ec2.yml run --rm certbot renew >> $LOG_FILE 2>&1

# Reload nginx to pick up new certificates
docker compose -f docker-compose.ec2.yml exec nginx nginx -s reload >> $LOG_FILE 2>&1

echo "[$(date)] SSL renewal check complete" >> $LOG_FILE
