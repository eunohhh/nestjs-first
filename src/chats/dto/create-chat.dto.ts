import { IsNumber } from 'class-validator';

export class CreateChatDto {
  // 각각의 값들이 전부 넘버인지 확인할 수 있도록 each 옵션
  @IsNumber({}, { each: true })
  userIds: number[];
}
