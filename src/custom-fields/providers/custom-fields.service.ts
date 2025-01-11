import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateCustomFieldDto } from '../dto/create-custom-field.dto';
import { CustomFieldDto } from '../dto/custom-field.dto';
import { UpdateCustomFieldDto } from '../dto/update-custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly db: PrismaService) {}

  async get(): Promise<CustomFieldDto[]> {
    return this.db.customField.findMany();
  }

  async getById(id: number): Promise<CustomFieldDto> {
    return this.db.customField.findUnique({ where: { id } });
  }

  async create(data: CreateCustomFieldDto): Promise<CustomFieldDto> {
    return this.db.customField.create({ data });
  }

  async update(
    id: number,
    data: UpdateCustomFieldDto,
  ): Promise<CustomFieldDto> {
    return this.db.customField.update({ where: { id }, data });
  }

  async delete(id: number): Promise<CustomFieldDto> {
    return this.db.customField.delete({ where: { id } });
  }
}
