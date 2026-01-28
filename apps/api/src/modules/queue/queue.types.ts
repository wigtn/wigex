/**
 * Queue Types for Travel Helper
 * Supports SQS (AWS) and Sync (local development)
 */

export enum QueueProvider {
  SQS = 'sqs',
  SYNC = 'sync', // 로컬 개발용 동기 처리
}

export enum QueueName {
  AI_PROCESSING = 'ai-processing',
  NOTIFICATIONS = 'notifications',
}

export enum JobType {
  // AI Processing Jobs
  OCR_RECEIPT = 'ocr-receipt',
  CHAT_RESPONSE = 'chat-response',

  // Notification Jobs
  PUSH_NOTIFICATION = 'push-notification',
  EMAIL_NOTIFICATION = 'email-notification',
}

export interface BaseJob {
  type: JobType;
  userId: string;
  timestamp: Date;
}

export interface OcrReceiptJob extends BaseJob {
  type: JobType.OCR_RECEIPT;
  imageUrl: string;
  tripId: string;
  callbackUrl?: string;
}

export interface ChatResponseJob extends BaseJob {
  type: JobType.CHAT_RESPONSE;
  tripId: string;
  message: string;
  conversationId: string;
}

export interface PushNotificationJob extends BaseJob {
  type: JobType.PUSH_NOTIFICATION;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  deviceTokens: string[];
}

export interface EmailNotificationJob extends BaseJob {
  type: JobType.EMAIL_NOTIFICATION;
  to: string;
  subject: string;
  template: string;
  templateData: Record<string, unknown>;
}

export type QueueJob =
  | OcrReceiptJob
  | ChatResponseJob
  | PushNotificationJob
  | EmailNotificationJob;

export interface QueueJobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
}

export interface QueueServiceInterface {
  addJob(
    queue: QueueName,
    job: QueueJob,
    options?: QueueJobOptions,
  ): Promise<string>;
  getJobStatus(queue: QueueName, jobId: string): Promise<string | null>;
}
