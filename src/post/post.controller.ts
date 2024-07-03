import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { User } from '../user/entities/User.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/createPost.dto';
import { UpdatePostDto } from './dtos/updatePost.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  getPosts() {
    return this.postService.getPosts();
  }

  @Post('/')
  createPost(@CurrentUser() user: User, @Body() createPostData: CreatePostDto) {
    return this.postService.createPost(user.id, createPostData);
  }

  @Put(':id')
  updatePost(
    @CurrentUser() user: User,
    @Param('id') postId: string,
    @Body() updatePostData: UpdatePostDto,
  ) {
    return this.postService.updatePost(user.id, postId, updatePostData);
  }
  @Delete(':id')
  deletePost(@CurrentUser() user: User, @Param('id') postId: string) {
    return this.postService.deletePost(user.id, postId);
  }
}
