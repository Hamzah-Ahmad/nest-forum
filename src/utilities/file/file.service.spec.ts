import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  describe('bufferToBase64', () => {
    it('should return the respective base64 encoded string', () => {
      const buffer = Buffer.from('Hello World');
      expect(service.bufferToBase64(buffer)).toEqual('SGVsbG8gV29ybGQ=');
    });
  });
  describe('base64ToBuffer', () => {
    it('should return the respective buffer', () => {
      const buffer = Buffer.from('Hello World');
      const base64String = `SGVsbG8gV29ybGQ`;
      expect(service.base64ToBuffer(base64String)).toEqual(buffer);
    });
  });
});
