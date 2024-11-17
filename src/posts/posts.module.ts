import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entity/image.entity';
import { UsersModule } from 'src/users/users.module';
import { PostsModel } from './entity/posts.entity';
import { PostsImagesService } from './image/images.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
// Nest can't resolve dependencies of the ... 등
// 상호 resource 간 참조시 아래 import 에 모듈 임포트를 했는지 확인할 것
// const validationPipe = new ValidationPipe({
//   transform: true,
//   transformOptions: {
//     enableImplicitConversion: true,
//   },
//   whitelist: true,
//   forbidNonWhitelisted: true,
// });

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
  exports: [PostsService],
})
export class PostsModule {}
