#!/bin/bash
# ===========================================
# Travel Helper - AWS 인프라 설정 스크립트
# ===========================================
# 개발/프로덕션 환경의 AWS 리소스 생성
#
# 사용법:
#   ./setup-infrastructure.sh dev    # 개발 환경
#   ./setup-infrastructure.sh prod   # 프로덕션 환경

set -e

ENV=${1:-dev}
REGION=${AWS_REGION:-ap-northeast-2}
PROJECT_NAME="travel-helper"

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "Usage: $0 [dev|prod]"
    exit 1
fi

echo "=========================================="
echo " Travel Helper AWS 인프라 설정"
echo " 환경: $ENV"
echo " 리전: $REGION"
echo "=========================================="

# AWS CLI 확인
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI가 설치되어 있지 않습니다."
    echo "설치: https://aws.amazon.com/cli/"
    exit 1
fi

# AWS 자격 증명 확인
echo ""
echo "1. AWS 자격 증명 확인..."
aws sts get-caller-identity || {
    echo "Error: AWS 자격 증명을 확인할 수 없습니다."
    echo "aws configure 를 실행하세요."
    exit 1
}

# SQS 큐 생성
echo ""
echo "2. SQS 큐 생성..."

# DLQ 생성
DLQ_NAME="${PROJECT_NAME}-${ENV}-dlq"
echo "   DLQ 생성: $DLQ_NAME"
DLQ_URL=$(aws sqs create-queue \
    --queue-name "$DLQ_NAME" \
    --region "$REGION" \
    --attributes '{
        "MessageRetentionPeriod": "1209600",
        "VisibilityTimeout": "300"
    }' \
    --tags "Environment=$ENV,Project=$PROJECT_NAME" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || \
    aws sqs get-queue-url --queue-name "$DLQ_NAME" --region "$REGION" --query 'QueueUrl' --output text)

DLQ_ARN=$(aws sqs get-queue-attributes \
    --queue-url "$DLQ_URL" \
    --region "$REGION" \
    --attribute-names QueueArn \
    --query 'Attributes.QueueArn' \
    --output text)

echo "   DLQ URL: $DLQ_URL"

# 메인 큐 생성
QUEUE_NAME="${PROJECT_NAME}-${ENV}-queue"
echo "   메인 큐 생성: $QUEUE_NAME"
QUEUE_URL=$(aws sqs create-queue \
    --queue-name "$QUEUE_NAME" \
    --region "$REGION" \
    --attributes "{
        \"MessageRetentionPeriod\": \"345600\",
        \"VisibilityTimeout\": \"120\",
        \"ReceiveMessageWaitTimeSeconds\": \"20\",
        \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"
    }" \
    --tags "Environment=$ENV,Project=$PROJECT_NAME" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || \
    aws sqs get-queue-url --queue-name "$QUEUE_NAME" --region "$REGION" --query 'QueueUrl' --output text)

echo "   Queue URL: $QUEUE_URL"

# S3 버킷 생성
echo ""
echo "3. S3 버킷 생성..."
BUCKET_NAME="${PROJECT_NAME}-${ENV}-assets-$(aws sts get-caller-identity --query 'Account' --output text)"
echo "   버킷: $BUCKET_NAME"

if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "   버킷이 이미 존재합니다."
else
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION" \
        --output text

    # 퍼블릭 액세스 차단
    aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

    echo "   버킷 생성 완료"
fi

# IAM 사용자 생성 (EC2에서 사용할 자격증명)
echo ""
echo "4. IAM 정책 확인..."
POLICY_NAME="${PROJECT_NAME}-${ENV}-policy"

# 정책 문서
POLICY_DOC=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
                "sqs:GetQueueUrl"
            ],
            "Resource": [
                "arn:aws:sqs:$REGION:*:$QUEUE_NAME",
                "arn:aws:sqs:$REGION:*:$DLQ_NAME"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        }
    ]
}
EOF
)

echo "   정책 문서 준비 완료"

# 결과 출력
echo ""
echo "=========================================="
echo " 설정 완료!"
echo "=========================================="
echo ""
echo "=== 환경 변수 (.env에 추가) ==="
echo ""
echo "# AWS 설정 ($ENV)"
echo "AWS_REGION=$REGION"
echo "AWS_SQS_QUEUE_URL=$QUEUE_URL"
echo "AWS_SQS_DLQ_URL=$DLQ_URL"
echo "AWS_S3_BUCKET=$BUCKET_NAME"
echo ""
echo "# AWS 자격증명 (IAM에서 생성 필요)"
echo "AWS_ACCESS_KEY_ID=your_access_key"
echo "AWS_SECRET_ACCESS_KEY=your_secret_key"
echo ""
echo "=== GitHub Secrets 추가 ==="
echo ""
if [ "$ENV" == "dev" ]; then
    echo "DEV_DOMAIN=dev.your-domain.com"
    echo "DEV_EC2_HOST=your-dev-ec2-ip"
    echo "DEV_EC2_USER=ubuntu"
    echo "DEV_EC2_SSH_KEY=(SSH 키 내용)"
else
    echo "PROD_DOMAIN=your-domain.com"
    echo "PROD_EC2_HOST=your-prod-ec2-ip"
    echo "PROD_EC2_USER=ubuntu"
    echo "PROD_EC2_SSH_KEY=(SSH 키 내용)"
fi
echo ""
echo "=== 다음 단계 ==="
echo "1. EC2 인스턴스 생성 (t2.micro 프리티어)"
echo "2. EC2에서 deploy/ec2/setup.sh 실행"
echo "3. .env 파일에 위 값들 설정"
echo "4. GitHub Secrets 설정"
echo "5. git push로 배포"
