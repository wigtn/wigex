import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [HttpModule, ExpenseModule],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
