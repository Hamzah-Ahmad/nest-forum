import { nanoid } from 'nanoid';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CloudStorageStrategy,
  ImageCloudUploadPayload,
} from './cloud-storage-strategy.interface';
import { uploadFile } from '@uploadcare/upload-client';

@Injectable()
export class UploadCareStrategy implements CloudStorageStrategy {
  constructor(private readonly configService: ConfigService) {}

  async uploadFile({ buffer, mimeType }: ImageCloudUploadPayload) {
    const result = await uploadFile(buffer, {
      publicKey: this.configService.getOrThrow('upload_care.apiKey'),
      store: 'auto',
      fileName: nanoid(),
      contentType: mimeType,
    });
    return `${result.cdnUrl}`;
  }
}
