import { Injectable } from '@nestjs/common';
import {
  CloudStorageStrategy,
  ImageCloudUploadPayload,
} from './strategies/cloud-storage-strategy.interface';

@Injectable()
export class CloudStorageService {
  private strategy: CloudStorageStrategy;

  public setStrategy(strategy: CloudStorageStrategy) {
    this.strategy = strategy;
  }

  public uploadFile(payload: ImageCloudUploadPayload) {
    return this.strategy.uploadFile(payload);
  }
}
