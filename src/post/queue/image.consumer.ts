import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import {
  POST_IMG_QUEUE,
  POST_IMG_UPLOAD_JOB,
} from '../../core/queue/queue.constants';
import { FileService } from '../../utilities/file/file.service';
import { UploadPostImageDto } from '../dtos/uploadPostImage.dto';
import { CloudStorageService } from '../../services/cloud-storage/cloud-storage.service';
import { UploadCareStrategy } from '../../services/cloud-storage/strategies/upload-care.strategy';
import { LoggerService } from '../../core/logger/logger.service';
import { PostService } from '../post.service';

@Processor(POST_IMG_QUEUE)
export class ImageConsumer {
  constructor(private readonly postService: PostService) {}

  @Process(POST_IMG_UPLOAD_JOB)
  async processUploadImageJob(job: Job<UploadPostImageDto>) {
    return await this.postService.uploadPostImage(job.data); // returning here to visualize return value in bull dashboard
  }

  // Handling error thrown specifically by POST_IMG_UPLOAD_JOB job
  // If the name property is not passed, the function will handle errors thrown by any function in this consumer
  @OnQueueFailed({ name: POST_IMG_UPLOAD_JOB })
  async onUploadError(job: Job<UploadPostImageDto>) {
    console.log('Upload Err ', job.name);
  }
}
