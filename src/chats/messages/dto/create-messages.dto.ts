import { PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { MessagesModel } from '../entity/messages.entity';

export class CreateMessagesDto extends PickType(MessagesModel, ['message']) {
  @IsNumber()
  chatId: number;
}
