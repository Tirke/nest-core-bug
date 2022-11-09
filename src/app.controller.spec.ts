import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  ClassSerializerInterceptor,
  ModuleMetadata,
  ValidationPipe,
} from '@nestjs/common';
import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie';
import { Reflector } from '@nestjs/core';

class TestWrapper extends Test {
  static createTestingModule(metadata: ModuleMetadata): TestingModuleBuilder {
    return super
      .createTestingModule({
        ...metadata,
        imports: [...(metadata.imports || [])],
      })
      .overrideProvider('REQUEST')
      .useValue({ authInfo: { token: 'token' } });
  }

  static async createTestingApp(
    metadata: ModuleMetadata,
  ): Promise<NestFastifyApplication> {
    const module = await TestWrapper.createTestingModule({
      ...metadata,
      imports: [...(metadata.imports || [])],
    }).compile();
    const app = module
      .createNestApplication<NestFastifyApplication>(new FastifyAdapter())
      .enableVersioning();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.register(fastifyCookie, {
      secret: 'my-secret', // for cookies signature
    } as FastifyCookieOptions);

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector), {
        exposeUnsetFields: false,
      }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
  }
}

describe('AppController', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await TestWrapper.createTestingApp({
      controllers: [AppController],
      providers: [AppService],
    });
  });

  afterAll(async () => {
    app.flushLogs();
    await app.close();
  });

  beforeEach(() => jest.resetAllMocks());

  describe('root', () => {
    it('buggy test', async () => {
      const payload = {
        code: 'randomCode',
      };
      const expectedStatus = 201;

      const result = await app.inject({
        url: `/password/submit-code`,
        method: 'POST',
        payload,
      });

      expect(result.statusCode).toBe(expectedStatus);
    });
  });
});
