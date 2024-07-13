import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './createComment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
