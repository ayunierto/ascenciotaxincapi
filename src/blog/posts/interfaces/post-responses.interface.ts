import { ExceptionResponse } from 'src/common/interfaces';
import { Post } from '../entities/post.entity';

export type GetPostsResponse = Post[] | ExceptionResponse;
export type GetPostResponse = Post | ExceptionResponse;
export type CreatePostResponse = Post | ExceptionResponse;
export type UpdatePostResponse = Post | ExceptionResponse;
export type DeletePostResponse = Post | ExceptionResponse;
