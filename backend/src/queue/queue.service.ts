// src/queue/queue.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const QUEUE_KEY = 'reservation:queue';

@Injectable()
export class QueueService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async joinQueue(userId: string): Promise<number> {
    const timestamp = Date.now();
    await this.redis.zadd(QUEUE_KEY, timestamp.toString(), userId);
    const rank = await this.redis.zrank(QUEUE_KEY, userId);
    if (rank === null) {
      throw new Error('Failed to get rank');
    }

    return rank + 1;
  }

  async getUserRank(userId: string): Promise<number> {
    const rank = await this.redis.zrank(QUEUE_KEY, userId);
    return rank ?? -1;
  }

  async confirmTopN(n: number): Promise<string[]> {
    const topUsers = await this.redis.zrange(QUEUE_KEY, 0, n - 1);
    for (const userId of topUsers) {
      await this.redis.zrem(QUEUE_KEY, userId);
    }
    return topUsers;
  }
}
