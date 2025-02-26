import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../../auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User) {
    try {
      const post = this.postRepository.create({
        user,
        ...createPostDto,
      });
      await this.postRepository.save(post);
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const posts = await this.postRepository.find({
      take: limit,
      skip: offset,
      relations: {
        user: true,
      },
    });

    return posts;
  }

  findOne(id: string) {
    return `This action returns a #${id} post`;
  }

  update(id: string, updatePostDto: UpdatePostDto, user: User) {
    return {
      id,
      updatePostDto,
      user,
    };
  }

  remove(id: string) {
    return `This action removes a #${id} post`;
  }
}
