import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueWorker } from './queue.worker';
import { RedisModule } from '../redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [RedisModule, EventEmitterModule.forRoot()],
  controllers: [QueueController],
  providers: [QueueService, QueueWorker],
  exports: [QueueService],
})
export class QueueModule {}
