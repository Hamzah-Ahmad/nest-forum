import * as request from 'supertest';
import { server, dataSource } from './setup';
import { User } from '../src/user/entities/User.entity';

describe('AuthController (e2e)', () => {
  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });
  it('should successfuly register', () => {
    const payload = {
      name: 'john',
      email: 'xyz@sadfjak.com',
      password: '2342388',
    };
    return request(server)
      .post('/auth/register')
      .send(payload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
  });


  it('should wrong email', () => {
    const payload = {
      name: 'john',
      email: 'wrong_format',
      password: '2342388',
    };
    return request(server)
      .post('/auth/register')
      .send(payload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400)
  });
});
