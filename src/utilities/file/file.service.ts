import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  // encoding a file to base64 string
  bufferToBase64(buffer: Buffer) {
    return buffer.toString(`base64`);
  }

  // decode a base64 string to a file buffer
  base64ToBuffer(base64String: string) {
    return Buffer.from(base64String, `base64`);
  }
}
