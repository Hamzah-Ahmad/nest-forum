import * as request from 'supertest';
import { server, dataSource } from './setup';
import { Post } from '../src/post/entities/post.entity';
import { User } from '../src/user/entities/User.entity';

describe('PostController (e2e)', () => {
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    // Register and login a user to obtain an access token

    if (!server || !dataSource) {
      throw new Error('Server or dataSource is not initialized');
    }

    const registerPayload = {
      name: 'john',
      email: 'xyz@sadfjak.com',
      password: '2342388',
    };

    const registerResponse = await request(server)
      .post('/auth/register')
      .send(registerPayload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    accessToken = registerResponse.body.accessToken;
    user = await dataSource
      .getRepository(User)
      .findOneBy({ email: registerPayload.email });
  });

  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Post).execute();
  });

  afterAll(async () => {
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

  it('should create a post successfully', () => {
    const payload = {
      title: 'Test Post',
      body: 'Test Body',
    };

    return request(server)
      .post('/post')
      .send(payload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          title: payload.title,
          body: payload.body,
          authorId: user.id,
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        });
      });
  });

  it('should update a post successfully', async () => {
    const createPostBody = {
      title: 'Test Post',
      body: 'Test Body',
    };
    const createPostResponse = await request(server)
      .post('/post')
      .send(createPostBody)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const postId = createPostResponse.body?.id;
    const updatePostBody = {
      title: 'Updated Test Post',
      body: 'Updated Test Body',
    };
    await request(server)
      .put(`/post/${postId}`)
      .send(updatePostBody)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          title: updatePostBody.title,
          body: updatePostBody.body,
          authorId: user.id,
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        });
      });
  });

  it('should delete a post successfully', async () => {
    const createPayload = {
      title: 'Test Post',
      body: 'Test Body',
    };

    const createResponse = await request(server)
      .post('/post')
      .send(createPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const postId = createResponse.body.id;

    return request(server)
      .delete(`/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ message: 'Success' });
      });
  });

  it('should successfully return a post by id', async () => {
    const createPostBody = {
      title: 'Test Post',
      body: 'Test Body',
    };

    const createPoolResponse = await request(server)
      .post(`/post`)
      .send(createPostBody)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const postId = createPoolResponse.body?.id;

    await request(server)
      .get(`/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          title: createPostBody.title,
          body: createPostBody.body,
          authorId: user.id,
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        });
      });
  });
});
