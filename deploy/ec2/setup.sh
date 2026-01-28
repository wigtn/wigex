#!/bin/bash
# ===========================================
# Travel Helper - EC2 초기 설정 스크립트
# ===========================================
# AWS EC2 t2.micro (프리티어)에서 실행
# sudo ./setup.sh

set -e

echo "=========================================="
echo " Travel Helper EC2 설정"
echo "=========================================="

# Root 확인
if [ "$EUID" -ne 0 ]; then
    echo "sudo로 실행해주세요: sudo ./setup.sh"
    exit 1
fi

ACTUAL_USER=${SUDO_USER:-ubuntu}
DEPLOY_DIR="/opt/travel-helper"

echo ""
echo "1. 시스템 업데이트..."
apt-get update
apt-get upgrade -y

echo ""
echo "2. Docker 설치..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker $ACTUAL_USER
    echo "   Docker 설치 완료"
else
    echo "   Docker 이미 설치됨"
fi

echo ""
echo "3. Docker Compose 설치..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "   Docker Compose 설치 완료"
else
    echo "   Docker Compose 이미 설치됨"
fi

echo ""
echo "4. Certbot 설치..."
apt-get install -y certbot

echo ""
echo "5. 디렉토리 생성..."
mkdir -p $DEPLOY_DIR/{nginx/conf.d,nginx/ssl,certbot/conf,certbot/www,backups,logs}
chown -R $ACTUAL_USER:$ACTUAL_USER $DEPLOY_DIR

echo ""
echo "6. Swap 파일 생성 (1GB RAM용)..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "   Swap 2GB 생성 완료"
else
    echo "   Swap 이미 존재"
fi

echo ""
echo "7. 방화벽 설정..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw --force enable
    echo "   방화벽 설정 완료"
fi

echo ""
echo "8. .env 템플릿 생성..."
cat > $DEPLOY_DIR/.env.template << 'ENVEOF'
# ===========================================
# Travel Helper - 환경 설정
# ===========================================
# 이 파일을 .env로 복사하고 값을 채워주세요
# cp .env.template .env && nano .env

# 환경 (development 또는 production)
NODE_ENV=production

# 도메인 (your-domain.com 또는 dev.your-domain.com)
DOMAIN=your-domain.com

# 데이터베이스
POSTGRES_USER=travel_helper
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=travel_helper

# JWT (openssl rand -base64 32 로 생성)
JWT_SECRET=CHANGE_ME_GENERATE_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_GENERATE_ANOTHER_SECRET

# AI
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here

# AWS
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SQS_QUEUE_URL=https://sqs.ap-northeast-2.amazonaws.com/xxx/travel-helper-xxx-queue
AWS_S3_BUCKET=travel-helper-xxx-assets

# Docker Registry
REGISTRY=ghcr.io/your-username/wigtn-travel-helper
IMAGE_TAG=development
ENVEOF

chown $ACTUAL_USER:$ACTUAL_USER $DEPLOY_DIR/.env.template

echo ""
echo "=========================================="
echo " 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo ""
echo "1. .env 파일 생성:"
echo "   cd $DEPLOY_DIR"
echo "   cp .env.template .env"
echo "   nano .env"
echo ""
echo "2. 배포 파일 복사 (GitHub에서):"
echo "   - docker-compose.ec2.yml"
echo "   - nginx/*.conf"
echo "   - deploy.sh"
echo ""
echo "3. SSL 인증서 설정:"
echo "   ./init-ssl.sh your-domain.com your@email.com"
echo ""
echo "4. 배포:"
echo "   ./deploy.sh"
echo ""
echo "* Docker 권한 적용을 위해 로그아웃 후 다시 로그인하세요"
