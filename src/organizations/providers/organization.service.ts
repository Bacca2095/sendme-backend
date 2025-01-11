import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationDto } from '../dto/organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly db: PrismaService) {}

  get(): Promise<OrganizationDto[]> {
    return this.db.organization.findMany();
  }

  getById(id: number): Promise<OrganizationDto> {
    return this.db.organization.findUnique({ where: { id } });
  }

  create(data: CreateOrganizationDto): Promise<OrganizationDto> {
    return this.db.organization.create({ data });
  }

  update(id: number, data: UpdateOrganizationDto): Promise<OrganizationDto> {
    return this.db.organization.update({ where: { id }, data });
  }

  remove(id: number): Promise<OrganizationDto> {
    return this.db.organization.delete({ where: { id } });
  }
}
