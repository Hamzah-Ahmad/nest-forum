import * as request from 'supertest';
import { server, dataSource } from './setup';
import { Post } from '../src/post/entities/post.entity'; // Adjust the path to your Post entity
import { User } from '../src/user/entities/User.entity'; // Adjust the path to your User entity

describe('PostController (e2e)', () => {
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    // Register and login a user to obtain an access token

    if (!server || !dataSource) {
      throw new Error("Server or dataSource is not initialized");
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
      .set('Accept', 'application/json')

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
});
