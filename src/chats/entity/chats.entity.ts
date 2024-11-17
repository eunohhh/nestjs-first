import { BaseModel } from 'src/common/entity/base.entity';
import { UsersModel } from 'src/users/entity/users.entity';
import { Entity, ManyToMany, OneToMany } from 'typeorm';
import { MessagesModel } from '../messages/entity/messages.entity';

// 엔티티 데코레이터 넣고 app.module에 TypeOrmModule.forRoot > entities 배열에 반드시 추가
@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[];

  @OneToMany(() => MessagesModel, (message) => message.chat)
  messages: MessagesModel;
}
