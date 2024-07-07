import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  POST_IMG_QUEUE,
  POST_IMG_UPLOAD_JOB,
} from '../../core/queue/queue.constants';
import { UploadPostImageDto } from '../dtos/uploadPostImage.dto';

@Injectable()
export class ImageProducer {
  constructor(@InjectQueue(POST_IMG_QUEUE) private queue: Queue) {}
  async uploadPostImage(payload: UploadPostImageDto) {
    return await this.queue.add(POST_IMG_UPLOAD_JOB, payload);
  }
}
