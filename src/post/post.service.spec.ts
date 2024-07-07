import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { randomUUID } from 'crypto';
import { UpdatePostDto } from './dtos/updatePost.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ImageProducer } from './queue/image.producer';
import { FileService } from '../utilities/file/file.service';

describe('PostService', () => {
  let service: PostService;
  let mockImageProducer = {
    uploadPostImage: jest.fn(),
  };
  let mockPostRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((dto) => ({ id: randomUUID(), ...dto })),
    findOneBy: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: ImageProducer,
          useValue: mockImageProducer,
        },
        {
          provide: FileService,
          // useClass: FileService,
          useValue: {
            bufferToBase64: jest
              .fn()
              .mockImplementation((buffer) =>
                Buffer.from(buffer).toString('base64'),
              ),
            base64ToBuffer: jest
              .fn()
              .mockImplementation((base64String) =>
                Buffer.from(base64String, 'base64'),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should test creating posts successfully', async () => {
    let newPost = { title: 'Test Post', body: 'Test Body' };
    let userId = randomUUID();
    let response = await service.createPost(userId, newPost);
    expect(response).toEqual({
      id: expect.any(String),
      title: 'Test Post',
      body: 'Test Body',
      authorId: userId,
    });
  });

  it('should update a post successfully', async () => {
    let postId = randomUUID();
    let userId = randomUUID();
    let foundPost = {
      id: postId,
      title: 'Old Title',
      body: 'Old Body',
      authorId: userId,
    };
    let updatePostData: UpdatePostDto = {
      title: 'New Title',
      body: 'New Body',
    };

    mockPostRepository.findOneBy.mockResolvedValue(foundPost);

    let response = await service.updatePost(userId, postId, updatePostData);
    expect(response).toEqual({
      id: postId,
      title: 'New Title',
      body: 'New Body',
      authorId: userId,
    });
  });

  it('should update prevent update if user not author of post', async () => {
    let postId = randomUUID();
    let userId = randomUUID();
    let otherUserId = randomUUID();
    let foundPost = {
      id: postId,
      title: 'Old Title',
      body: 'Old Body',
      authorId: userId,
    };
    let updatePostData: UpdatePostDto = {
      title: 'New Title',
      body: 'New Body',
    };

    mockPostRepository.findOneBy.mockResolvedValue(foundPost);

    expect(
      service.updatePost(otherUserId, postId, updatePostData),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should delete a post successfully', async () => {
    let postId = randomUUID();
    let userId = randomUUID();
    let foundPost = {
      id: postId,
      title: 'Old Title',
      body: 'Old Body',
      authorId: userId,
    };

    mockPostRepository.findOneBy.mockResolvedValue(foundPost);
    mockPostRepository.delete.mockResolvedValue({ affected: 1 });

    let response = await service.deletePost(userId, postId);
    expect(response).toEqual({ message: 'Success' });
  });

  it('should find a post by ID successfully', async () => {
    let postId = randomUUID();
    let foundPost = {
      id: postId,
      title: 'Test Post',
      body: 'Test Body',
      authorId: randomUUID(),
    };

    mockPostRepository.findOneBy.mockResolvedValue(foundPost);

    let response = await service.getPostById(postId);
    expect(response).toEqual(foundPost);
  });

  it('should find throw a NotFoundException error if post not found', async () => {
    let postId = randomUUID();

    mockPostRepository.findOneBy.mockResolvedValue(null);

    await expect(service.getPostById(postId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if post not found by ID', async () => {
    let postId = randomUUID();

    mockPostRepository.findOneBy.mockResolvedValue(null);

    await expect(service.getPostById(postId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
