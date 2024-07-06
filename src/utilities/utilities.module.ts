import { Global, Module } from '@nestjs/common';
import { FileService } from './file/file.service';

@Global()
@Module({
  providers: [FileService],
  exports: [FileService],
})
export class UtilitiesModule {}