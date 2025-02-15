import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { AppErrorCodesEnum } from '../enums/app-error-codes.enum';
import { AppError } from '../errors/app.error';
import { ExceptionHandler } from '../exceptions/interfaces/exception-handler.interface';

@Injectable()
export class HandleExceptionsService implements OnModuleInit {
  private static instance: HandleExceptionsService;
  private readonly logger = new Logger('HandleExceptions');
  private handlers: ExceptionHandler[];

  constructor(private readonly moduleRef: ModuleRef) {}

  static getInstance(): HandleExceptionsService {
    if (!HandleExceptionsService.instance) {
      throw new AppError(AppErrorCodesEnum.HANDLE_EXCEPTIONS_NOT_INITIALIZE);
    }
    return HandleExceptionsService.instance;
  }

  async onModuleInit() {
    HandleExceptionsService.instance = this;

    this.handlers = this.moduleRef.get<ExceptionHandler[]>(
      'EXCEPTION_HANDLERS',
      {
        strict: false,
      },
    );
  }

  async handleErrors(error: unknown): Promise<never> {
    this.logger.error(error);

    if (error instanceof HttpException) {
      throw error;
    }

    for (const handler of this.handlers) {
      const errorData = handler.isType(error);
      if (errorData) {
        handler.execute(error);
      }
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
