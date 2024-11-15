import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as multer from 'multer';
import { extname } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';
import { UsersModule } from 'src/users/users.module';
import { v4 as uuid } from 'uuid';
import { PostsModel } from './entities/posts.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

// Nest can't resolve dependencies of the ... 등
// 상호 resource 간 참조시 아래 import 에 모듈 임포트를 했는지 확인할 것
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    MulterModule.register({
      limits: {
        // 바이트입력
        fileSize: 10000000,
      },
      fileFilter: (req, file, callback) => {
        /**
         * callback(error, boolean)
         */
        const extension = extname(file.originalname);
        if (
          extension !== '.jpg' &&
          extension !== '.jpeg' &&
          extension !== '.png'
        ) {
          return callback(
            new BadRequestException('jpg/jpeg/png 만 가능'),
            false,
          );
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, callback) {
          callback(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
