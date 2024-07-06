import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class MaxFileCountPipe implements PipeTransform {
  constructor(private readonly maxCount: number = 4) {}
  transform(files: Express.Multer.File[] = []) {
    // Default array argument to prevent e2e errors.
    // When making a request from a client that doesn't include any files, the NestJS framework handles it gracefully because it's designed to work with optional multipart file uploads. However, in the context of automated tests (e2e tests), the testing framework might not handle the absence of the files array in the same way.

    if (files.length > this.maxCount) {
      throw new BadRequestException(`Maximum ${this.maxCount} files allowed`);
    }

    return files;
  }
}
