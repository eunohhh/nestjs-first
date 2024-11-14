import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts
  // 모든 posts 를 다 가져온다
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }
  // GET /posts/:id
  // 해당되는 id의 post를 가져온다
  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(Number(id));
  }
  // POST /posts
  // post를 생성한다
  @Post()
  postPosts(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(authorId, title, content);
  }
  // PUT /posts/:id
  // 해당되는 id의 포스트를 변경한다
  @Put(':id')
  putPost(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(Number(id), title, content);
  }
  // DELETE /posts/:id
  // 해당되는 id의 포스트를 삭제한다
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(Number(id));
  }
}
