import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MaxFileCountPipe implements PipeTransform {
  constructor(private readonly maxCount: number = 4) {}
  transform(files: Express.Multer.File[]) {
    if (files.length > this.maxCount) {
      throw new BadRequestException(`Maximum ${this.maxCount} files allowed`)
    }

    return files;
  }
}
