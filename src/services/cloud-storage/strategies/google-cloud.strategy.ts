import { Storage } from '@google-cloud/storage';
import { nanoid } from 'nanoid';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CloudStorageStrategy,
  ImageCloudUploadPayload,
} from './cloud-storage-strategy.interface';

@Injectable()
export class GoogleCloudStrategy implements CloudStorageStrategy {
  private storage: Storage;
  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.getOrThrow(`gcp.projectId`),
      credentials: {
        client_email: this.configService.getOrThrow(`gcp.clientEmail`),
        private_key: this.configService.getOrThrow(`gcp.privateKey`),
      },
    });
  }

  async uploadFile({ buffer, mimeType }: ImageCloudUploadPayload) {
    const bucketName = this.configService.getOrThrow(`gcp.buckets.images`);
    const bucket = this.storage.bucket(bucketName);
    const fileName = nanoid(); //TODO: Generate random filename
    const file = bucket.file(fileName);
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      gzip: true,
    });
    await file.makePublic();
    return file.publicUrl();
  }
}
