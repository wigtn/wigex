import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { SQSService } from './sqs.service';
import { SyncQueueService } from './sync.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QueueService, SQSService, SyncQueueService],
  exports: [QueueService],
})
export class QueueModule {}
