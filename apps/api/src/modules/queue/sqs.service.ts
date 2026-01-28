import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import {
  QueueServiceInterface,
  QueueName,
  QueueJob,
  QueueJobOptions,
  JobType,
} from './queue.types';

/**
 * AWS SQS Queue Service
 * 프로덕션 및 개발 서버에서 사용
 */
@Injectable()
export class SQSService
  implements QueueServiceInterface, OnModuleInit, OnModuleDestroy
{
  private client: SQSClient | null = null;
  private queueUrl: string | null = null;
  private dlqUrl: string | null = null;
  private isPolling = false;
  private pollTimeout: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const region = this.configService.get<string>('AWS_REGION');
    const queueUrl = this.configService.get<string>('AWS_SQS_QUEUE_URL');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!region || !queueUrl || !accessKeyId || !secretAccessKey) {
      console.warn('[SQS] Missing configuration, service disabled');
      return;
    }

    this.client = new SQSClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.queueUrl = queueUrl;
    this.dlqUrl = this.configService.get<string>('AWS_SQS_DLQ_URL') ?? null;

    // 메시지 폴링 시작
    this.startPolling();

    console.log('[SQS] Service initialized');
  }

  async onModuleDestroy() {
    this.isPolling = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
    this.client?.destroy();
  }

  async addJob(
    queueName: QueueName,
    job: QueueJob,
    options?: QueueJobOptions,
  ): Promise<string> {
    if (!this.client || !this.queueUrl) {
      throw new Error('[SQS] Service not initialized');
    }

    const messageBody = JSON.stringify({
      ...job,
      _queue: queueName,
      _timestamp: new Date().toISOString(),
    });

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: messageBody,
      DelaySeconds: options?.delay ? Math.min(Math.floor(options.delay / 1000), 900) : 0,
      MessageAttributes: {
        JobType: { DataType: 'String', StringValue: job.type },
        QueueName: { DataType: 'String', StringValue: queueName },
        UserId: { DataType: 'String', StringValue: job.userId },
      },
    });

    const response = await this.client.send(command);
    console.log(`[SQS] Job added: ${response.MessageId}`);
    return response.MessageId ?? '';
  }

  async getJobStatus(
    queueName: QueueName,
    jobId: string,
  ): Promise<string | null> {
    // SQS는 메시지 ID로 상태 조회를 지원하지 않음
    // 상태 추적이 필요하면 DynamoDB 등 별도 저장소 사용
    return null;
  }

  private startPolling() {
    this.isPolling = true;
    this.poll();
  }

  private async poll() {
    if (!this.isPolling || !this.client || !this.queueUrl) return;

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20, // Long polling
        MessageAttributeNames: ['All'],
        VisibilityTimeout: 120, // 2분 (AI 처리 시간 고려)
      });

      const response = await this.client.send(command);

      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          await this.processMessage(message);
        }
      }
    } catch (error) {
      console.error('[SQS] Polling error:', error);
    }

    // 다음 폴링 스케줄
    if (this.isPolling) {
      this.pollTimeout = setTimeout(() => this.poll(), 1000);
    }
  }

  private async processMessage(message: Message) {
    if (!message.Body || !message.ReceiptHandle || !this.client || !this.queueUrl) {
      return;
    }

    try {
      const job = JSON.parse(message.Body) as QueueJob;
      console.log(`[SQS] Processing: ${message.MessageId} (${job.type})`);

      // 작업 처리
      await this.executeJob(job);

      // 성공 시 메시지 삭제
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );

      console.log(`[SQS] Completed: ${message.MessageId}`);
    } catch (error) {
      console.error(`[SQS] Failed: ${message.MessageId}`, error);
      // 실패 시 메시지는 visibility timeout 후 다시 처리되거나 DLQ로 이동
    }
  }

  private async executeJob(job: QueueJob): Promise<void> {
    switch (job.type) {
      case JobType.OCR_RECEIPT:
        console.log(`[SQS] OCR processing: ${(job as any).imageUrl}`);
        // TODO: AI 서비스 호출하여 OCR 처리
        // await this.aiService.processReceipt(job);
        break;

      case JobType.CHAT_RESPONSE:
        console.log(`[SQS] Chat processing: ${(job as any).conversationId}`);
        // TODO: AI 서비스 호출하여 챗봇 응답 생성
        // await this.aiService.generateChatResponse(job);
        break;

      case JobType.PUSH_NOTIFICATION:
        console.log(`[SQS] Push notification: ${(job as any).title}`);
        // TODO: FCM/APNs 푸시 알림 전송
        // await this.notificationService.sendPush(job);
        break;

      case JobType.EMAIL_NOTIFICATION:
        console.log(`[SQS] Email: ${(job as any).to}`);
        // TODO: 이메일 전송
        // await this.notificationService.sendEmail(job);
        break;

      default:
        console.warn(`[SQS] Unknown job type: ${(job as any).type}`);
    }
  }
}
