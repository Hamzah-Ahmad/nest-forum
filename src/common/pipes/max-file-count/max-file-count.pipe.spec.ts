import { BadRequestException } from '@nestjs/common';
import { MaxFileCountPipe } from './max-file-count.pipe';

describe('MaxFileCountPipe', () => {
  let maxFileCountPipe: MaxFileCountPipe;

  beforeEach(() => {
    maxFileCountPipe = new MaxFileCountPipe(2);
  });

  it('should be defined', () => {
    expect(maxFileCountPipe).toBeDefined();
  });
  it('should return badRequest if number of files is greater than the maxCount', () => {
    const file = {} as Express.Multer.File;
    // When testing agains exceptions, you need to return a function when calling the respective method
    // https://jestjs.io/docs/expect#tothrowerror
    const result = () => maxFileCountPipe.transform([file, file, file]);
    expect(result).toThrow(BadRequestException);
  });
  it('should return the files passed in when the count is less than the max count', () => {
    const file = {} as Express.Multer.File;
    const result = maxFileCountPipe.transform([file]);
    expect(result).toEqual([file]);
  });
  it('should return the files passed in when the count is the same as the max count', () => {
    const file = {} as Express.Multer.File;
    const result = maxFileCountPipe.transform([file, file]);
    expect(result).toEqual([file, file]);
  });
});
