import { Body, Controller, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/User.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:postId')
  addCommentToPost(
    @Body() body: CreateCommentDto,
    @CurrentUser() user: User,
    @Param('postId') postId: string,
  ) {
    return this.commentService.addCommentToPost(
      body.commentText,
      postId,
      user.id,
    );
  }

  @Post('/reply/:parentId')
  addReplyToComment(
    @Body() body: CreateCommentDto,
    @CurrentUser() user: User,
    @Param('parentId') parentId: string,
  ) {
    return this.commentService.addReplyToComment(
      body.commentText,
      parentId,
      user.id,
    );
  }
}
