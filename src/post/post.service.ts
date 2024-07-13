import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dtos/createPost.dto';
import { UpdatePostDto } from './dtos/updatePost.dto';
import { ImageProducer } from './queue/image.producer';
import { FileService } from '../utilities/file/file.service';
import { LoggerService } from '../core/logger/logger.service';
import { UploadPostImageDto } from './dtos/uploadPostImage.dto';
import { CloudStorageService } from '../services/cloud-storage/cloud-storage.service';
import { UploadCareStrategy } from '../services/cloud-storage/strategies/upload-care.strategy';
import { PostImage } from './entities/postImage.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    private readonly fileService: FileService,
    private readonly cloudStorageService: CloudStorageService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly imageProducer: ImageProducer,
  ) {}

  getPosts() {
    return this.postRepository.find();
  }

  async getPostById(id: string) {
    // try-catch to handle "invalid input syntax for type uuid:" error
    try {
      const foundPost = await this.postRepository.findOneBy({
        id,
      });
      if (!foundPost) throw new NotFoundException();
      return foundPost;
    } catch (err) {
      throw new NotFoundException();
    }
  }
  async createPost(
    userId: string,
    createPostData: CreatePostDto,
    images?: Express.Multer.File[],
  ) {
    let newPost = this.postRepository.create({
      authorId: userId,
      body: createPostData.body,
      title: createPostData.title,
    });

    const post = await this.postRepository.save(newPost);

    // Sending images to quque
    if (images && Array.isArray(images)) {
      for (const image of images) {
        await this.imageProducer.uploadPostImage({
          base64String: this.fileService.bufferToBase64(image.buffer),
          mimeType: image.mimetype,
          postId: post.id,
        });
      }
    }

    return post;
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

  async uploadPostImage(data: UploadPostImageDto) {
    // const bucketName = this.configService.getOrThrow(`gcp.buckets.images`);
    const buffer = this.fileService.base64ToBuffer(data.base64String);
    // The function is expecting the base64 text of the file instead of the actual file.
    // This is because it is not best practice to use images with redis. Redis is best suited for text.
    this.cloudStorageService.setStrategy(
      new UploadCareStrategy(this.configService),
    );
    try {
      const imageUrl = await this.cloudStorageService.uploadFile({
        buffer,
        mimeType: data.mimeType,
      });

      let image = this.postImageRepository.create({
        postId: data.postId,
        url: imageUrl,
      });
      return await this.postImageRepository.save(image);
    } catch (err) {
      this.loggerService.error(err);
    }
  }
}
