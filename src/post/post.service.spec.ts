import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { CreateUserDto } from 'src/user/dto/CreateUserDto';
import { randomUUID } from 'crypto';
import { UpdatePostDto } from './dtos/updatePost.dto';

describe('PostService', () => {
  let service: PostService;
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

  it('should delete a post successfully', async () => {
    let postId = randomUUID();
    let userId = randomUUID();
    let foundPost = { id: postId, title: 'Old Title', body: 'Old Body', authorId: userId };

    mockPostRepository.findOneBy.mockResolvedValue(foundPost);
    mockPostRepository.delete.mockResolvedValue({ affected: 1 });

    let response = await service.deletePost(userId, postId);
    expect(response).toEqual({ message: 'Success' });
  });

});
