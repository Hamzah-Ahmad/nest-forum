import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  POST_IMG_QUEUE,
  POST_IMG_UPLOAD_JOB,
} from '../../core/queue/queue.constants';
import { FileService } from 'src/utilities/file/file.service';
import { UploadPostImageDto } from '../dtos/uploadPostImage.dto';

@Processor(POST_IMG_QUEUE)
export class ImageConsumer {
  constructor(private readonly fileService: FileService) {}

  @Process(POST_IMG_UPLOAD_JOB)
  async processUploadImageJob(job: Job<UploadPostImageDto>) {
    const buffer = this.fileService.base64ToBuffer(job.data.base64String);
    // The function is expecting the base64 text of the file instead of the actual file.
    // This is because it is not best practice to use images with redis. Redis is best suited for text.

    console.log('JOB PROCESS ', buffer);
  }

  // Handling error thrown specifically by POST_IMG_UPLOAD_JOB job
  // If the name property is not passed, the function will handle errors thrown by any function in this consumer
  @OnQueueFailed({ name: POST_IMG_UPLOAD_JOB })
  async onUploadError(job: Job<UploadPostImageDto>) {
    console.log('Upload Err ', job.name);
  }
}
