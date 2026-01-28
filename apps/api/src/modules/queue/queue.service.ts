import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  QueueServiceInterface,
  QueueProvider,
  QueueName,
  QueueJob,
  QueueJobOptions,
  JobType,
} from './queue.types';
import { SQSService } from './sqs.service';
import { SyncQueueService } from './sync.service';

/**
 * Queue Service - 환경에 따라 SQS 또는 Sync 사용
 *
 * - Local: QUEUE_PROVIDER=sync (동기 처리)
 * - Dev/Prod: QUEUE_PROVIDER=sqs (AWS SQS)
 */
@Injectable()
export class QueueService implements QueueServiceInterface {
  private provider: QueueServiceInterface;
  private providerType: QueueProvider;

  constructor(
    private configService: ConfigService,
    private sqsService: SQSService,
    private syncService: SyncQueueService,
  ) {
    const queueProvider = this.configService.get<string>(
      'QUEUE_PROVIDER',
      QueueProvider.SYNC,
    );
    this.providerType = queueProvider as QueueProvider;

    if (this.providerType === QueueProvider.SQS) {
      this.provider = this.sqsService;
      console.log('[Queue] Using AWS SQS');
    } else {
      this.provider = this.syncService;
      console.log('[Queue] Using Sync (local development)');
    }
  }

  getProviderType(): QueueProvider {
    return this.providerType;
  }

  async addJob(
    queue: QueueName,
    job: QueueJob,
    options?: QueueJobOptions,
  ): Promise<string> {
    return this.provider.addJob(queue, job, options);
  }

  async getJobStatus(queue: QueueName, jobId: string): Promise<string | null> {
    return this.provider.getJobStatus(queue, jobId);
  }

  // ============================================
  // 편의 메서드들
  // ============================================

  async addOcrJob(
    userId: string,
    tripId: string,
    imageUrl: string,
    options?: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(
      QueueName.AI_PROCESSING,
      {
        type: JobType.OCR_RECEIPT,
        userId,
        tripId,
        imageUrl,
        timestamp: new Date(),
      } as any,
      options,
    );
  }

  async addChatJob(
    userId: string,
    tripId: string,
    conversationId: string,
    message: string,
    options?: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(
      QueueName.AI_PROCESSING,
      {
        type: JobType.CHAT_RESPONSE,
        userId,
        tripId,
        conversationId,
        message,
        timestamp: new Date(),
      } as any,
      options,
    );
  }

  async addPushNotificationJob(
    userId: string,
    title: string,
    body: string,
    deviceTokens: string[],
    data?: Record<string, unknown>,
    options?: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(
      QueueName.NOTIFICATIONS,
      {
        type: JobType.PUSH_NOTIFICATION,
        userId,
        title,
        body,
        deviceTokens,
        data,
        timestamp: new Date(),
      } as any,
      options,
    );
  }

  async addEmailJob(
    userId: string,
    to: string,
    subject: string,
    template: string,
    templateData: Record<string, unknown>,
    options?: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(
      QueueName.NOTIFICATIONS,
      {
        type: JobType.EMAIL_NOTIFICATION,
        userId,
        to,
        subject,
        template,
        templateData,
        timestamp: new Date(),
      } as any,
      options,
    );
  }
}
