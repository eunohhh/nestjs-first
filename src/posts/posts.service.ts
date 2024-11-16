import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import { ENV_HOST, ENV_PROTOCOL } from 'src/common/const/env-keys.const';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { CommonService } from './../common/common.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsModel } from './entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `random title ${i}`,
        content: `random posts ${i}`,
      });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    // if (dto.page) {
    //   this.pagePaginatePosts(dto);
    // } else {
    //   this.cursorPaginatePosts(dto);
    // }
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        relations: ['author'],
      },
      'posts',
    );
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    /**
     * data: data[]
     * total: number
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    const protocol = this.configService.get(ENV_PROTOCOL);
    const host = this.configService.get(ENV_HOST);
    // 해당되는 포스트가 0개 이상이면
    // 마지막 포스트를 가져오고
    // 아니면 null 을 반환한다.
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;
    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);

    if (nextUrl) {
      /**
       * dto 의 키값들을 루핑하면서
       * 키값에 해당하는 밸류가 존재하면
       * param에 그대로 붙여넣는다
       * 단, where__id_more_than 값만 lastItem의 마지막 값으로 넣어준다
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }
    /**
     * Response
     *
     * data: data[]
     * cursor: {
     *   after: 마지막 data 의 ID
     * }
     * count: 응답한 데이터의 개수
     * next: 다음 요청을 할 때 사용할 url
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException();
    return post;
  }

  async createPostImage(dto: CreatePostDto) {
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.image);

    try {
      // 파일이 존재하는지 확인
      // 만약에 존재하지 않으면 에러던짐
      await promises.access(tempFilePath);
    } catch {
      throw new BadRequestException('존재하지 않는 파일입니다');
    }

    // 파일의 이름만 가져오기
    const fileName = basename(tempFilePath);
    // 새로 이동할 post 폴더의 경로
    const newPath = join(POST_IMAGE_PATH, fileName);

    // 파일 옮기기
    await promises.rename(tempFilePath, newPath);

    return true;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    // create -> 저장할 객체를 생성한다
    // save -> 객체를 저장한다(create 메서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async updatePost(postId: number, updateDto: UpdatePostDto) {
    const { title, content } = updateDto;
    // save 의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id 값이 존재한다면) 존재하던 값을 업데이트한다.

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) throw new NotFoundException();

    if (title) post.title = title;
    if (content) post.content = content;

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) throw new NotFoundException();

    await this.postsRepository.delete(postId);
    return postId;
  }
}
