import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

import { ExceptionHandler } from './interfaces/exception-handler.interface';

@Injectable()
export class PrismaValidationExceptionsHandler extends ExceptionHandler {
  private readonly logger = new Logger(PrismaValidationExceptionsHandler.name);

  isType(error: unknown): Record<string, unknown> | null {
    if (error instanceof PrismaClientValidationError) {
      const errorData = {
        type: 'prisma-validation-error',
        stackTrace: JSON.stringify(
          this.getStackTrace(error as PrismaClientValidationError),
        ),
      };

      this.logger.error(errorData);
      return errorData;
    }
    return null;
  }

  execute(error: PrismaClientValidationError): never {
    throw new BadRequestException(error.stack);
  }
}
