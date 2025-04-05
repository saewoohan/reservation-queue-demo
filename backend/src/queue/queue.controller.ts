// src/queue/queue.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Sse,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map, merge, filter, switchMap } from 'rxjs';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('join')
  async joinQueue(@Body() body: { userId: string }) {
    const rank = await this.queueService.joinQueue(body.userId);
    return { rank };
  }

  @Get('rank')
  async getRank(@Query('userId') userId: string) {
    const rank = await this.queueService.getUserRank(userId);
    return { rank };
  }

  @Sse('events')
  getEvents(@Query('userId') userId: string): Observable<any> {
    // 특정 사용자에 대한 확정 이벤트 처리
    const confirmedEvent = fromEvent(
      this.eventEmitter,
      'queue.user.confirmed',
    ).pipe(
      filter((event: any) => event.userId === userId),
      map(() => ({
        data: JSON.stringify({
          event: 'confirmed',
          message: '대기열에서 처리되었습니다.',
          confirmed: true,
        }),
      })),
    );

    // 큐 업데이트 이벤트에서 해당 사용자의 순위 계산
    const updateEvent = fromEvent(this.eventEmitter, 'queue.updated').pipe(
      switchMap(async () => {
        const rank = await this.queueService.getUserRank(userId);
        return {
          data: JSON.stringify({
            event: 'update',
            rank: rank + 1,
            timestamp: Date.now(),
          }),
        };
      }),
    );

    // 두 이벤트 스트림 합치기
    return merge(confirmedEvent, updateEvent);
  }

  // 확정된 사용자를 위한 별도의 엔드포인트 (선택사항)
  @Get('confirm')
  async confirmUser(@Query('userId') userId: string, @Res() res: Response) {
    const rank = await this.queueService.getUserRank(userId);

    if (rank === 0) {
      // 사용자가 큐의 맨 앞에 있는 경우
      await this.queueService.confirmTopN(1);
      this.eventEmitter.emit('queue.updated');
      return res.status(HttpStatus.OK).json({
        confirmed: true,
        message: '예약이 확정되었습니다.',
      });
    }

    return res.status(HttpStatus.OK).json({
      confirmed: false,
      rank,
      message: `현재 대기 순위는 ${rank + 1}번입니다.`,
    });
  }
}
