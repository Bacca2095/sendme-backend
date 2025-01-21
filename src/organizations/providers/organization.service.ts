import { Injectable } from '@nestjs/common';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationDto } from '../dto/organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly db: PrismaService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  @HandleExceptions()
  async get(): Promise<OrganizationDto[]> {
    const organizationId = this.als.getValidatedOrganizationId();

    if (!this.als.isAdmin()) {
      return this.db.organization.findMany({
        where: { id: organizationId },
      });
    }

    return this.db.organization.findMany();
  }

  @HandleExceptions()
  async getById(id: number): Promise<OrganizationDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    if (!this.als.isAdmin() && id !== organizationId) {
      throw new AppError(AppErrorCodesEnum.FORBIDDEN);
    }

    const organization = await this.db.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new AppError(AppErrorCodesEnum.RESOURCE_NOT_FOUND);
    }

    return organization;
  }

  @HandleExceptions()
  async create(data: CreateOrganizationDto): Promise<OrganizationDto> {
    if (!this.als.isAdmin()) {
      throw new AppError(AppErrorCodesEnum.FORBIDDEN);
    }

    return this.db.organization.create({ data });
  }

  @HandleExceptions()
  async update(
    id: number,
    data: UpdateOrganizationDto,
  ): Promise<OrganizationDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    if (!this.als.isAdmin() && id !== organizationId) {
      throw new AppError(AppErrorCodesEnum.FORBIDDEN);
    }

    const organization = await this.db.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new AppError(AppErrorCodesEnum.RESOURCE_NOT_FOUND);
    }

    return this.db.organization.update({ where: { id }, data });
  }

  @HandleExceptions()
  async remove(id: number): Promise<OrganizationDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    if (!this.als.isAdmin() && id !== organizationId) {
      throw new AppError(AppErrorCodesEnum.FORBIDDEN);
    }

    const organization = await this.db.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new AppError(AppErrorCodesEnum.RESOURCE_NOT_FOUND);
    }

    return this.db.organization.delete({ where: { id } });
  }
}
