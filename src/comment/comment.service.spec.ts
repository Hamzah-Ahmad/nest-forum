import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { randomUUID } from 'crypto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { Repository } from 'typeorm';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let mockCommentRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((dto) => ({ id: randomUUID(), ...dto })),
    findOneBy: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  let mockPostRepository = {
    findOneBy: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,

        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully add a comment to post', async () => {
    let newComment = { commentText: 'Test Comment' };
    let postId = randomUUID();
    let userId = randomUUID();
    mockPostRepository.findOneBy = jest.fn().mockResolvedValue({
      id: postId,
      title: 'New Title',
      body: 'New Body',
      authorId: userId,
    });
    let response = await service.addCommentToPost(newComment, postId, userId);
    expect(response).toEqual({
      id: expect.any(String),
      commentText: 'Test Comment',
      postId: postId,
      authorId: userId,
    });
  });

  it('should add a reply to a comment successfully', async () => {
    let authorId = randomUUID();
    let postId = randomUUID();
    let parentComment = {
      id: randomUUID(),
      commentText: 'Parent comment',
      postId: postId,
      authorId: authorId,
    };
    mockCommentRepository.findOne = jest.fn().mockResolvedValue(parentComment);

    let replyBody = { commentText: 'This is a reply' };

    let res = await service.addReplyToComment(
      replyBody,
      parentComment.id,
      authorId,
    );

    expect(res).toEqual({
      id: expect.any(String),
      commentText: 'This is a reply',
      parentId: parentComment.id,
      postId: postId,
      authorId: authorId,
    });
  });

  it('should update a comment successfully', async () => {
    let commentId = randomUUID();
    let userId = randomUUID();
    let foundComment = {
      id: commentId,
      commentText: 'This is a comment',
      postId: randomUUID(),
      authorId: userId,
    };
    let updatePostData: UpdateCommentDto = {
      commentText: 'This is an updated comment',
    };

    mockCommentRepository.findOneBy.mockResolvedValue(foundComment);

    let response = await service.updateComment(
      updatePostData,
      commentId,
      userId,
    );
    expect(response).toEqual({
      id: commentId,
      commentText: 'This is an updated comment',
      authorId: userId,
      postId: expect.any(String),
    });
  });

  it('should prevent update if user not author of comment', async () => {
    let commentId = randomUUID();
    let userId = randomUUID();
    let otherUserId = randomUUID();
    let foundComment = {
      id: commentId,
      commentText: 'This is a comment',
      postId: randomUUID(),
      authorId: userId,
    };
    let updatePostData: UpdateCommentDto = {
      commentText: 'This is an updated comment',
    };

    mockCommentRepository.findOneBy.mockResolvedValue(foundComment);

    expect(
      service.updateComment(updatePostData, commentId, otherUserId),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should delete a comment successfully', async () => {
    let commentId = randomUUID();
    let userId = randomUUID();
    let post = {
      id: randomUUID(),
      title: 'New Title',
      body: 'New Body',
      authorId: userId,
    };
    let foundComment = {
      id: commentId,
      commentText: 'This is a comment',
      postId: randomUUID(),
      authorId: userId,
      post: post,
    };

    mockCommentRepository.findOne.mockResolvedValue(foundComment);

    let response = await service.deleteComment(commentId, userId);
    expect(response).toEqual({ message: 'Success' });
  });

  it('should prevent deleting a comment if user is not comment author or post author', async () => {
    let commentId = randomUUID();
    let userId = randomUUID();
    let otherUserId = randomUUID();
    let post = {
      id: randomUUID(),
      title: 'New Title',
      body: 'New Body',
      authorId: userId,
    };
    let foundComment = {
      id: commentId,
      commentText: 'This is a comment',
      postId: randomUUID(),
      authorId: userId,
      post: post,
    };

    mockCommentRepository.findOne.mockResolvedValue(foundComment);

    expect(service.deleteComment(commentId, otherUserId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("should allow post author to delete other user's comments", async () => {
    let commentId = randomUUID();
    let userId = randomUUID();
    let otherUserId = randomUUID();
    let post = {
      id: randomUUID(),
      title: 'New Title',
      body: 'New Body',
      authorId: userId,
    };
    let foundComment = {
      id: commentId,
      commentText: 'This is a comment',
      postId: randomUUID(),
      authorId: otherUserId,
      post: post,
    };

    mockCommentRepository.findOne.mockResolvedValue(foundComment);

    let response = await service.deleteComment(commentId, userId);
    expect(response).toEqual({ message: 'Success' });
  });
});
