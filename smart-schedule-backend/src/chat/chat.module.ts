import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [ScheduleModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
