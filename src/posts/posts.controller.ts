import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '민지 왔쪄염 뿌우',
    likeCount: 10000000,
    commentCount: 99999,
  },
  {
    id: 2,
    author: 'newjeans_official2',
    title: '뉴진스 해린',
    content: '해린 왔쪄염 뿌우',
    likeCount: 10000000,
    commentCount: 99999,
  },
  {
    id: 3,
    author: 'blackpink_official',
    title: '뉴진스 로제',
    content: '종합운동장에서 공연중인 로제',
    likeCount: 10000000,
    commentCount: 99999,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts
  // 모든 posts 를 다 가져온다
  @Get()
  getPosts() {
    return posts;
  }
  // GET /posts/:id
  // 해당되는 id의 post를 가져온다
  @Get(':id')
  getPost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === Number(id));
    if (!post) throw new NotFoundException();
    return post;
  }
  // POST /posts
  // post를 생성한다
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];
    return posts;
  }
  // PUT /posts/:id
  // 해당되는 id의 포스트를 변경한다
  @Put(':id')
  putPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const post = posts.find((post) => post.id === Number(id));

    if (!post) throw new NotFoundException();

    if (author) post.author = author;
    if (title) post.title = title;
    if (content) post.content = content;

    posts = posts.map((prevPost) =>
      prevPost.id === Number(id) ? post : prevPost,
    );

    return posts;
  }
  // DELETE /posts/:id
  // 해당되는 id의 포스트를 삭제한다
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === Number(id));

    if (!post) throw new NotFoundException();

    posts = posts.filter((post) => post.id !== Number(id));

    return id;
  }
}
