import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { FastifyReply } from 'fastify';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class SubmitResetPasswordCodeBodyDto {
  @Expose()
  @IsString()
  code: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/password/submit-code')
  async submitCode(
    @Body() { code }: SubmitResetPasswordCodeBodyDto,
    @Res() res: FastifyReply,
  ) {
    console.log(code);
    return 'ok';
  }
}
