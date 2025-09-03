import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../../auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  CreatePostResponse,
  DeletePostResponse,
  GetPostResponse,
  GetPostsResponse,
  UpdatePostResponse,
} from './interfaces';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    user: User,
  ): Promise<CreatePostResponse> {
    try {
      const post = this.postRepository.create({
        user,
        ...createPostDto,
      });
      await this.postRepository.save(post);
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<GetPostsResponse> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const posts = await this.postRepository.find({
        take: limit,
        skip: offset,
        relations: {
          user: true,
        },
      });

      return posts;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<GetPostResponse> {
    try {
      const post = await this.postRepository.findOne({ where: { id } });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: User,
  ): Promise<UpdatePostResponse> {
    try {
      const post = await this.postRepository.findOne({
        where: { id, user: { id: user.id } },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      this.postRepository.merge(post, updatePostDto);
      await this.postRepository.save(post);
      return post;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the post. Please try again later.',
        'POST_UPDATE_FAILED',
      );
    }
  }

  async remove(id: string, user: User): Promise<DeletePostResponse> {
    try {
      const post = await this.postRepository.findOne({
        where: { id, user: { id: user.id } },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      await this.postRepository.remove(post);
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
