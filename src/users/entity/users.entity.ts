import { Exclude } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { ChatsModel } from 'src/chats/entity/chats.entity';
import { MessagesModel } from 'src/chats/messages/entity/messages.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { CommentsModel } from 'src/posts/comments/entity/comments.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { UserFollowersModel } from './user-followers.entity';

@Entity()
// 여기에 Exclude 하고 각 프로퍼티에 Expose 해서 기본으로 막고 노출할 것만 노출할 수도 있음
// @Exclude()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  // 길이가 20을 넘지않을 것
  // 유일무이한 값이 될 것
  nickname: string;

  // @Expose()
  // get nicknameAndEmail() {
  //   return this.nickname + this.email;
  // }

  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  // @IsEmail(null, {
  //   message: stringValidationMessage,
  // })
  @IsEmail()
  // 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  /**
   * Request
   * frontend -> backend
   * plain object (JSON) -> class instance (dto)
   *
   * Response
   * bakcend -> frontend
   * class instance (dto) -> plain object (JSON)
   *
   * toClassOnly -> class instance로 변환될때만(요청이 들어올때)
   * toPlainOnly -> plain object로 변환될때만(응답이 나갈때)
   */
  @Exclude({
    // 응답에서만 삭제
    toPlainOnly: true,
    // 요청에서만 삭제
    // toClassOnly: true
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  postComments: CommentsModel[];

  // 내가 팔로우 하고 있는 사람들
  @OneToMany(() => UserFollowersModel, (ufm) => ufm.follower)
  followers: UserFollowersModel[];

  // 나를 팔로우 하고 있는 사람들
  @OneToMany(() => UserFollowersModel, (ufm) => ufm.followee)
  followees: UserFollowersModel[];

  @Column({
    default: 0,
  })
  followerCount: number;

  @Column({
    default: 0,
  })
  followeeCount: number;
}
