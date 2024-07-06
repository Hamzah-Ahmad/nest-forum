import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dtos/createPost.dto';
import { UpdatePostDto } from './dtos/updatePost.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  getPosts() {
    return this.postRepository.find();
  }

  async getPostById(id: string) {
    // try-catch to handle "invalid input syntax for type uuid:" error
    try {
      const foundPost = await this.postRepository.findOneBy({ id });
      if (!foundPost) throw new NotFoundException();
      return foundPost;
    } catch (err) {
      throw new NotFoundException();
    }
  }
  createPost(
    userId: string,
    createPostData: CreatePostDto,
    images?: Express.Multer.File[],
  ) {
    let newPost = this.postRepository.create({
      authorId: userId,
      body: createPostData.body,
      title: createPostData.title,
    });
    return this.postRepository.save(newPost);
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostData: UpdatePostDto,
  ) {
    let foundPost = await this.postRepository.findOneBy({ id: postId });
    if (!foundPost) throw new NotFoundException('Post not found');

    if (foundPost.authorId !== userId)
      throw new UnauthorizedException(
        'You are not authorized to edit this post',
      );

    return await this.postRepository.save({
      ...foundPost,
      ...updatePostData,
    });
  }

  async deletePost(userId: string, postId: string) {
    let foundPost = await this.postRepository.findOneBy({ id: postId });
    if (!foundPost) throw new NotFoundException('Post not found');

    if (foundPost.authorId !== userId)
      throw new UnauthorizedException(
        'You are not authorized to edit this post',
      );

    let res = await this.postRepository.delete({ id: postId });
    if (res.affected === 1) return { message: 'Success' };
  }
}
