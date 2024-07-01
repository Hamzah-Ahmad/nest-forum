import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import helmet from 'helmet';
import { DataSource } from 'typeorm';

let app: INestApplication;
let server: any;
let dataSource: DataSource;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  server = app.getHttpServer();
  dataSource = app.get(DataSource);
});

afterAll(async () => {
  await app.close();
});

export { server, app, dataSource };
