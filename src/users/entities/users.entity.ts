import { IsEmail, IsString, Length } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';

@Entity()
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

  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(null, {
    message: stringValidationMessage,
  })
  // 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
