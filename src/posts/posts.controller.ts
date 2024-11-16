import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { ImageModelType } from 'src/common/entities/image.entity';
import { User } from 'src/users/decorators/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { DataSource } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsImagesService } from './image/images.service';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // GET /posts
  // 모든 posts 를 다 가져온다
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  // GET /posts/:id
  // 해당되는 id의 post를 가져온다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }
  // POST /posts
  // post를 생성한다
  // DTO - data transfer object
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(
    @User() user: UsersModel,
    @Body() body: CreatePostDto,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    // 트랜젝션과 관련된 모든 쿼리를 담당할 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // 쿼리러너에 연결한다
    await qr.connect();
    // 쿼리 러너에서 트랜젝션 시작
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜젝션 안에서 데이터베이스 액션을 실행 할 수 있다.
    await qr.startTransaction();

    // 실행하고 싶은 로직 실행
    try {
      const post = await this.postsService.createPost(user.id, body, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch {
      // 어떤 에러든 발생하면 트랜젝션 종료하고 원래상태로 되돌린다
      await qr.rollbackTransaction();
      await qr.release();

      throw new InternalServerErrorException('에러가 발생했습니다.');
    }
  }
  // PATCH /posts/:id
  // 해당되는 id의 포스트를 변경한다
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }
  // DELETE /posts/:id
  // 해당되는 id의 포스트를 삭제한다
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
