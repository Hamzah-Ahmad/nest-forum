import * as request from 'supertest';
import { server, dataSource } from './setup';
import { Post } from '../src/post/entities/post.entity';
import { User } from '../src/user/entities/User.entity';
import { Comment } from '../src/comment/entities/comment.entity';

describe('CommentController (e2e)', () => {
  let user: User;
  let post: Post;
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

    const postPayload = {
      title: 'Test Post',
      body: 'Test Body',
    };
    let res = await request(server)
      .post(`/post`)
      .send(postPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    post = await dataSource.getRepository(Post).findOneBy({ id: res.body.id });
  });

  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Comment).execute();
  });

  afterAll(async () => {
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await dataSource.createQueryBuilder().delete().from(Post).execute();
  });

  it('should create a comment successfully', () => {
    const payload = {
      commentText: 'Comment body',
    };

    return request(server)
      .post(`/comment/${post.id}`)
      .send(payload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          commentText: 'Comment body',
          authorId: user.id,
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
          postId: post.id,
          parentId: null,
        });
      });
  });

  it('should succesfully reply to a comment', async () => {
    const parentPayload = {
      commentText: 'Parent Comment',
    };
    const replyPayload = {
      commentText: 'Reply Comment',
    };

    const parentRes = await request(server)
      .post(`/comment/${post.id}`)
      .send(parentPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    await request(server)
      .post(`/comment/reply/${parentRes.body.id}`)
      .send(replyPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          commentText: 'Reply Comment',
          authorId: user.id,
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
          postId: post.id,
          parentId: parentRes.body.id,
        });
      });
  });

  it('should get comments by post', async () => {
    const commentPayload = {
      commentText: 'Comment on post',
    };

    const commentRes = await request(server)
      .post(`/comment/${post.id}`)
      .send(commentPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    // const comment = await request(server)
    //   .post(`/comment/${parentRes.body.id}`)
    //   .send(replyPayload)
    //   .set('Authorization', `Bearer ${accessToken}`)
    //   .set('Content-Type', 'application/json')
    //   .set('Accept', 'application/json');

    await request(server)
      .get(`/comment/${post.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([{ ...commentRes.body, replyCount: 0 }]);
      });
  });

  ////////////////////////////////////////////////////////////////////////

  it('should get replies to comments', async () => {
    const commentPayload = {
      commentText: 'Comment on post',
    };

    const replyPayload = {
      commentText: 'Reply to comment',
    };

    const parentCommentResp = await request(server)
      .post(`/comment/${post.id}`)
      .send(commentPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const commentReply = await request(server)
      .post(`/comment/reply/${parentCommentResp.body.id}`)
      .send(replyPayload)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    await request(server)
      .get(`/comment/reply/${parentCommentResp.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([{ ...commentReply.body, replyCount: 0 }]);
      });
  });
});
