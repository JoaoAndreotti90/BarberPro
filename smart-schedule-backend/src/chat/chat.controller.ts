import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() dto: CreateChatDto) {
    const response = await this.chatService.generateResponse(dto.message);
    return { response };
  }
}