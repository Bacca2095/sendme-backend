import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { ConfigPaymentProviderDto } from '../dto/config-payment-provider.dto';
import { CreatePaymentProviderDto } from '../dto/create-payment-provider.dto';
import { PaymentProviderDto } from '../dto/payment-provider.dto';
import { UpdatePaymentProviderDto } from '../dto/update-payment-provider.dto';

@Injectable()
export class PaymentProviderService {
  constructor(
    private readonly db: PrismaService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  private validateAdminAccess() {
    const isAdmin = this.als.isAdmin();
    if (!isAdmin) {
      throw new AppError(AppErrorCodesEnum.FORBIDDEN);
    }
  }

  @HandleExceptions()
  async get() {
    this.validateAdminAccess();
    const providers = await this.db.paymentProvider.findMany();
    return providers.map((provider) => ({
      ...provider,
      config: provider.config as unknown as ConfigPaymentProviderDto,
    }));
  }

  @HandleExceptions()
  async getById(id: number) {
    this.validateAdminAccess();
    const provider = await this.db.paymentProvider.findUnique({
      where: { id },
    });
    return {
      ...provider,
      config: provider.config as unknown as ConfigPaymentProviderDto,
    };
  }

  @HandleExceptions()
  async create(data: CreatePaymentProviderDto) {
    this.validateAdminAccess();
    const provider = await this.db.paymentProvider.create({
      data: {
        ...data,
        config: data.config as unknown as Prisma.JsonObject,
      },
    });
    return {
      ...provider,
      config: provider.config as unknown as ConfigPaymentProviderDto,
    };
  }

  @HandleExceptions()
  async update(id: number, data: UpdatePaymentProviderDto) {
    this.validateAdminAccess();

    const currentProvider = await this.db.paymentProvider.findUniqueOrThrow({
      where: { id },
    });

    const currentConfig = currentProvider.config as Prisma.JsonObject;

    const updatedConfig = JSON.stringify({
      ...currentConfig,
      ...data.config,
      propertyMapping: {
        ...(currentConfig['propertyMapping'] as Prisma.JsonObject),
        ...data.config?.propertyMapping,
      },
      hashConfig: {
        ...(currentConfig['hashConfig'] as Prisma.JsonObject),
        ...data.config?.hashConfig,
      },
      signature: {
        ...(currentConfig['signature'] as Prisma.JsonObject),
        ...data.config?.signature,
      },
    });

    const provider = await this.db.paymentProvider.update({
      where: { id },
      data: {
        ...data,
        config: updatedConfig,
      },
    });

    return {
      ...provider,
      config: provider.config as unknown as ConfigPaymentProviderDto,
    };
  }

  @HandleExceptions()
  async delete(id: number): Promise<PaymentProviderDto> {
    this.validateAdminAccess();
    const provider = await this.db.paymentProvider.delete({ where: { id } });
    return {
      ...provider,
      config: provider.config as unknown as ConfigPaymentProviderDto,
    };
  }
}
