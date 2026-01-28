import { Injectable } from '@nestjs/common';
import {
  QueueServiceInterface,
  QueueName,
  QueueJob,
  QueueJobOptions,
  JobType,
} from './queue.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sync Queue Service - 로컬 개발용
 * 작업을 즉시 동기적으로 처리합니다.
 * 프로덕션에서는 SQS를 사용하세요.
 */
@Injectable()
export class SyncQueueService implements QueueServiceInterface {
  private jobs: Map<string, { status: string; job: QueueJob }> = new Map();

  async addJob(
    queueName: QueueName,
    job: QueueJob,
    options?: QueueJobOptions,
  ): Promise<string> {
    const jobId = uuidv4();

    console.log(`[Sync Queue] Processing job ${jobId} of type ${job.type}`);
    this.jobs.set(jobId, { status: 'processing', job });

    try {
      // 동기적으로 즉시 처리
      await this.processJob(job);
      this.jobs.set(jobId, { status: 'completed', job });
      console.log(`[Sync Queue] Job ${jobId} completed`);
    } catch (error) {
      this.jobs.set(jobId, { status: 'failed', job });
      console.error(`[Sync Queue] Job ${jobId} failed:`, error);
    }

    return jobId;
  }

  async getJobStatus(
    queueName: QueueName,
    jobId: string,
  ): Promise<string | null> {
    const jobInfo = this.jobs.get(jobId);
    return jobInfo?.status ?? null;
  }

  private async processJob(job: QueueJob): Promise<void> {
    // 실제 처리 로직은 각 서비스에서 구현
    // 여기서는 로깅만 수행
    switch (job.type) {
      case JobType.OCR_RECEIPT:
        console.log(`[Sync] Processing OCR for image: ${(job as any).imageUrl}`);
        // TODO: AI 서비스 호출
        break;

      case JobType.CHAT_RESPONSE:
        console.log(`[Sync] Processing chat: ${(job as any).message}`);
        // TODO: AI 서비스 호출
        break;

      case JobType.PUSH_NOTIFICATION:
        console.log(`[Sync] Sending push: ${(job as any).title}`);
        // TODO: FCM/APNs 호출
        break;

      case JobType.EMAIL_NOTIFICATION:
        console.log(`[Sync] Sending email to: ${(job as any).to}`);
        // TODO: 이메일 서비스 호출
        break;
    }

    // 시뮬레이션 딜레이 (개발 중 테스트용)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
