import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Controller('chats')
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  paginateChat(@Query() dto: PaginateChatDto) {
    return this.chatsService.paginateChats(dto);
  }
}
