import { Module } from '@nestjs/common';

import { AppExceptionsHandler } from './exceptions/app-exceptions.handler';
import { AxiosExceptionsHandler } from './exceptions/axios-exceptions.handler';
import { PrismaExceptionsHandler } from './exceptions/prisma-exceptions.handler';
import { PrismaValidationExceptionsHandler } from './exceptions/prisma-validation-exception.handler';
import { HandleExceptionsService } from './providers/handle-exceptions.service';

@Module({
  providers: [
    PrismaExceptionsHandler,
    AppExceptionsHandler,
    AxiosExceptionsHandler,
    HandleExceptionsService,
    PrismaValidationExceptionsHandler,
    {
      provide: 'EXCEPTION_HANDLERS',
      useFactory: (
        prismaHandler: PrismaExceptionsHandler,
        appHandler: AppExceptionsHandler,
        axiosHandler: AxiosExceptionsHandler,
        prismaValidationHandler: PrismaValidationExceptionsHandler,
      ) => [prismaHandler, appHandler, axiosHandler, prismaValidationHandler],
      inject: [
        PrismaExceptionsHandler,
        AppExceptionsHandler,
        AxiosExceptionsHandler,
        PrismaValidationExceptionsHandler,
      ],
    },
  ],
  exports: [HandleExceptionsService],
})
export class ExceptionsModule {}
