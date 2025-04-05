import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from './queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class QueueWorker {
  private readonly logger = new Logger(QueueWorker.name);
  private isProcessing = false;

  constructor(
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'process-queue-every-minute',
  })
  async processQueue() {
    if (this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = true;
      this.logger.log('Processing queue...');

      const processCount = 1;
      const confirmedUsers = await this.queueService.confirmTopN(processCount);

      if (confirmedUsers.length > 0) {
        this.logger.log(
          `Processed ${confirmedUsers.length} users from the queue`,
        );

        // 대기열에서 처리된 사용자들을 처리 큐로 이동

        for (const userId of confirmedUsers) {
          this.eventEmitter.emit('queue.user.confirmed', { userId });
        }

        this.eventEmitter.emit('queue.updated');
      } else {
        this.logger.debug('No users to process in the queue');
      }
    } catch (error) {
      this.logger.error(
        `Error processing queue: ${error.message}`,
        error.stack,
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
