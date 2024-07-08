import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { BullModule } from '@nestjs/bull';
import { ImageProducer } from './queue/image.producer';
import { ImageConsumer } from './queue/image.consumer';
import { POST_IMG_QUEUE } from '../core/queue/queue.constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { CloudStorageModule } from '../services/cloud-storage/cloud-storage.module';
import { PostImage } from './entities/postImage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage]),
    BullModule.registerQueue({ name: POST_IMG_QUEUE }),
    BullBoardModule.forFeature({ name: POST_IMG_QUEUE, adapter: BullAdapter }),
    CloudStorageModule,
  ],
  providers: [PostService, ImageProducer, ImageConsumer],
  controllers: [PostController],
})
export class PostModule {}
