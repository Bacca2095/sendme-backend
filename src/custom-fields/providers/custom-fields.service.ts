import { Injectable } from '@nestjs/common';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateCustomFieldDto } from '../dto/create-custom-field.dto';
import { CustomFieldDto } from '../dto/custom-field.dto';
import { UpdateCustomFieldDto } from '../dto/update-custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    private readonly db: PrismaService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  @HandleExceptions()
  async get(): Promise<CustomFieldDto[]> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { organizationId } : {};

    return this.db.customField.findMany({ where: whereClause });
  }

  @HandleExceptions()
  async getById(id: number): Promise<CustomFieldDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    return this.db.customField.findUnique({ where: whereClause });
  }

  @HandleExceptions()
  async create(data: CreateCustomFieldDto): Promise<CustomFieldDto> {
    const organizationId = this.als.getValidatedOrganizationId(
      data.organizationId,
    );

    if (!organizationId) {
      throw new AppError(AppErrorCodesEnum.ORGANIZATION_ID_NOT_FOUND);
    }

    return this.db.customField.create({
      data: { ...data, organizationId },
    });
  }

  @HandleExceptions()
  async update(
    id: number,
    data: UpdateCustomFieldDto,
  ): Promise<CustomFieldDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    return this.db.customField.update({
      where: { id, organizationId },
      data,
    });
  }

  @HandleExceptions()
  async delete(id: number): Promise<CustomFieldDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    return this.db.customField.delete({ where: whereClause });
  }
}
