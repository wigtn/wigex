#!/bin/bash
# ===========================================
# Travel Helper - AWS SQS Setup Script
# ===========================================
# Prerequisites: AWS CLI installed and configured
# Run: aws configure (set your credentials first)

set -e

# Configuration
REGION=${AWS_REGION:-ap-northeast-2}
QUEUE_NAME="travel-helper-queue"
DLQ_NAME="travel-helper-dlq"

echo "=== Setting up AWS SQS for Travel Helper ==="
echo "Region: $REGION"

# Create Dead Letter Queue (DLQ) first
echo "Creating Dead Letter Queue..."
DLQ_URL=$(aws sqs create-queue \
    --queue-name $DLQ_NAME \
    --region $REGION \
    --attributes '{
        "MessageRetentionPeriod": "1209600",
        "VisibilityTimeout": "300"
    }' \
    --query 'QueueUrl' \
    --output text)

echo "DLQ URL: $DLQ_URL"

# Get DLQ ARN
DLQ_ARN=$(aws sqs get-queue-attributes \
    --queue-url $DLQ_URL \
    --region $REGION \
    --attribute-names QueueArn \
    --query 'Attributes.QueueArn' \
    --output text)

echo "DLQ ARN: $DLQ_ARN"

# Create main queue with DLQ redrive policy
echo "Creating main queue..."
QUEUE_URL=$(aws sqs create-queue \
    --queue-name $QUEUE_NAME \
    --region $REGION \
    --attributes '{
        "MessageRetentionPeriod": "345600",
        "VisibilityTimeout": "120",
        "ReceiveMessageWaitTimeSeconds": "20",
        "RedrivePolicy": "{\"deadLetterTargetArn\":\"'$DLQ_ARN'\",\"maxReceiveCount\":\"3\"}"
    }' \
    --query 'QueueUrl' \
    --output text)

echo "Queue URL: $QUEUE_URL"

# Get Queue ARN
QUEUE_ARN=$(aws sqs get-queue-attributes \
    --queue-url $QUEUE_URL \
    --region $REGION \
    --attribute-names QueueArn \
    --query 'Attributes.QueueArn' \
    --output text)

echo "Queue ARN: $QUEUE_ARN"

echo ""
echo "=== SQS Setup Complete ==="
echo ""
echo "Add these to your .env file:"
echo ""
echo "AWS_SQS_REGION=$REGION"
echo "AWS_SQS_QUEUE_URL=$QUEUE_URL"
echo "AWS_SQS_DLQ_URL=$DLQ_URL"
echo ""
echo "Make sure you also have AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY set."
