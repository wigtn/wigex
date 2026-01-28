#!/bin/bash
# ===========================================
# Travel Helper - SSL Certificate Setup
# ===========================================
set -e

DOMAIN=${1:-your-domain.com}
EMAIL=${2:-admin@your-domain.com}
DEPLOY_DIR="/opt/travel-helper"

echo "=== Setting up SSL for $DOMAIN ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo ./init-ssl.sh domain.com email@domain.com"
    exit 1
fi

# Stop nginx if running
echo "Stopping nginx..."
docker compose -f $DEPLOY_DIR/docker-compose.ec2.yml stop nginx 2>/dev/null || true

# Get certificate
echo "Obtaining SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d api.$DOMAIN \
    -d admin.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --expand

# Create directory for certificates
mkdir -p $DEPLOY_DIR/certbot/conf/live/$DOMAIN
mkdir -p $DEPLOY_DIR/certbot/conf/archive/$DOMAIN

# Copy certificates
echo "Copying certificates..."
cp -rL /etc/letsencrypt/live/$DOMAIN/* $DEPLOY_DIR/certbot/conf/live/$DOMAIN/
cp -rL /etc/letsencrypt/archive/$DOMAIN/* $DEPLOY_DIR/certbot/conf/archive/$DOMAIN/

# Set permissions
ACTUAL_USER=${SUDO_USER:-$USER}
chown -R $ACTUAL_USER:$ACTUAL_USER $DEPLOY_DIR/certbot/

# Update nginx config to use actual domain
echo "Updating nginx configuration..."
if [ -f $DEPLOY_DIR/nginx/conf.d/api.conf ]; then
    sed -i "s/your-domain.com/$DOMAIN/g" $DEPLOY_DIR/nginx/conf.d/api.conf
fi
if [ -f $DEPLOY_DIR/nginx/conf.d/admin.conf ]; then
    sed -i "s/your-domain.com/$DOMAIN/g" $DEPLOY_DIR/nginx/conf.d/admin.conf
fi

# Start nginx
echo "Starting nginx..."
docker compose -f $DEPLOY_DIR/docker-compose.ec2.yml up -d nginx

echo ""
echo "=== SSL Setup Complete ==="
echo ""
echo "Certificates are in: $DEPLOY_DIR/certbot/conf/live/$DOMAIN/"
echo ""
echo "Certificate renewal will be handled automatically by the certbot container."
echo ""
echo "To manually renew: docker compose -f $DEPLOY_DIR/docker-compose.ec2.yml run --rm certbot renew"
