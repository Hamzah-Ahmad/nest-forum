import { Repository } from 'typeorm';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Post } from '../post/entities/post.entity';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/updateComment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async addCommentToPost(commentText: string, postId: string, userId: string) {
    const foundPost = await this.postRepository.findOneBy({ id: postId });
    if (!foundPost)
      throw new NotFoundException('Post with specified ID was not found');
    const newComment = this.commentRepository.create({
      commentText,
      postId: postId,
      authorId: userId,
    });
    return await this.commentRepository.save(newComment);
  }

  async addReplyToComment(
    commentText: string,
    parentId: string,
    userId: string,
  ) {
    const parentComment = await this.commentRepository.findOne({
      where: {
        id: parentId,
      },
      select: {
        id: true, // for performance
        postId: true, // for relation below
      },
      // relations: ['replies'],
    });

    if (!parentComment) {
      throw new NotFoundException(
        'Failed to add reply. A comment with the provided ID was not found',
      );
    }
    const newReply = this.commentRepository.create({
      commentText,
      authorId: userId,
      parentId: parentComment.id, // We are getting parentComment from above so we can use this. We could  also use the parentId we get from the arguments. But using the parentComment ID this way ensures that there is a comment with this ID in the db
      postId: parentComment.postId,
    });

    // parentComment.replies = [...parentComment.replies, newReply]; // using {cascade: true} in the relations with replies allows the newReply to be saved when parentComment is saved. But using append like this can cause performance issues because we are spreading everytime which might cause problemsif there are too many replies

    return await this.commentRepository.save(newReply);
    // Doing the following can also work. Leaving it for future reference
    // const parentComment = await this.commentRepository.findOne({
    //   where: {
    //     id: parentId,
    //   },
    // });
    //   const newReply = await this.commentRepository.create({
    //     ...commentBody,
    //     authorId: user.id,
    //   });
    //   newReply.parent = parentComment;
    //   return await this.commentRepository.save(newReply);
  }

  async getReplies(parentId: string) {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.parentId = :parentId', { parentId })
      .loadRelationCountAndMap('comment.replyCount', 'comment.replies')
      .getMany();
    return comments;
  }

  async getCommentsByPosts(postId: string) {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL')
      .loadRelationCountAndMap('comment.replyCount', 'comment.replies')
      .getMany();

    return comments;
  }

  async updateComment(
    commentBody: UpdateCommentDto,
    commentId: string,
    userId: string,
  ) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });

    if (!comment) {
      throw new NotFoundException('Failed to find comment with provided ID');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        null,
        'You are not authenticated to update this comment',
      );
    }
    try {
      const updatedComment = await this.commentRepository.save({
        ...comment,
        ...commentBody,
      });

      return updatedComment;
    } catch (err) {
      console.log(err);
      throw new HttpException('Error updating comment', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post'],
    });

    if (!comment) {
      throw new NotFoundException('Failed to find comment with provided ID');
    }

    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException(
        null,
        'You are not authenticated to delete this comment',
      );
    }

    try {
      await this.commentRepository.remove(comment);
    } catch (err) {
      console.log(err);
      throw new HttpException('Error deleting comment', HttpStatus.BAD_REQUEST);
    }
  }
}
