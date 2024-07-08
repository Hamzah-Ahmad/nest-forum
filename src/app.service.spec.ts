import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { LoggerService } from './core/logger/logger.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
describe('AppService', () => {
  let appService: AppService;
  let configService: DeepMocked<ConfigService>; // Deep Mocking config service because its function (configService.get) is being used directly in the code so we need to mock the configSErvice.get function
  let loggerService: DeepMocked<LoggerService>;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
    configService = app.get(ConfigService);
    loggerService = app.get(LoggerService);
  });

  describe('root', () => {
    it('should return "Hello World"', async () => {
      // We can set methods either in the it block or in any of the outer describe blocks.
      configService.get = jest.fn().mockReturnValue('development');
      loggerService.log = jest.fn();
      const result = await appService.getPublic();
      expect(result).toBe('This is a public route');
    });
  });
});
