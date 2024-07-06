import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { User } from '../user/entities/User.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/createPost.dto';
import { UpdatePostDto } from './dtos/updatePost.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MaxFileCountPipe } from 'src/common/pipes/max-file-count/max-file-count.pipe';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  getPosts() {
    return this.postService.getPosts();
  }
  @Get('/:id')
  getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Post('/')
  @UseInterceptors(FilesInterceptor('images', 2))
  // Second argument in FielsInterceptor is max number of files allowed. But the error message is not user friendly so we are creating a custom validation pipe for this
  createPost(
    @CurrentUser() user: User,
    @Body() createPostData: CreatePostDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: `.(png|jpg|jpeg)` }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB,
        ],
        fileIsRequired: false,
      }),
      new MaxFileCountPipe(2),
    )
    images: Express.Multer.File[],
  ) {
    return this.postService.createPost(user.id, createPostData, images);
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
