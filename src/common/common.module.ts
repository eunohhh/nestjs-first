import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { extname } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { v4 as uuid } from 'uuid';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { TEMP_FOLDER_PATH } from './const/path.const';
@Module({
  imports: [
    AuthModule,
    UsersModule,
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
          callback(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
