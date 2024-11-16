import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { ImageModelType } from 'src/common/entities/image.entity';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { User } from 'src/users/decorators/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
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
  @UseInterceptors(LogInterceptor)
  @UseFilters(HttpExceptionFilter)
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
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User() user: UsersModel,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
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

    return this.postsService.getPostById(post.id, qr);
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
