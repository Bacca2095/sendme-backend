import { Injectable } from '@nestjs/common';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { ContactDto } from '../dto/contact.dto';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly db: PrismaService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  @HandleExceptions()
  async get(): Promise<ContactDto[]> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { organizationId } : {};

    return this.db.contact.findMany({
      where: whereClause,
      include: { customValue: true },
    });
  }

  @HandleExceptions()
  async getById(id: number): Promise<ContactDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    return this.db.contact.findUnique({
      where: whereClause,
      include: { customValue: true },
    });
  }

  @HandleExceptions()
  async create(data: CreateContactDto): Promise<ContactDto> {
    const organizationId = this.als.getValidatedOrganizationId(
      data.organizationId,
    );

    if (!organizationId) {
      throw new AppError(AppErrorCodesEnum.ORGANIZATION_ID_NOT_FOUND);
    }

    const { customValue } = data;
    return this.db.contact.create({
      data: {
        ...data,
        organizationId,
        customValue: customValue
          ? { createMany: { data: customValue } }
          : undefined,
      },
      include: { customValue: true },
    });
  }

  @HandleExceptions()
  async update(id: number, data: UpdateContactDto): Promise<ContactDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    const { customValue } = data;
    const updatedContact = await this.db.contact.update({
      where: { id, organizationId },
      data: {
        ...data,
        customValue: customValue
          ? {
              upsert: customValue.map((value) => ({
                where: { id: value.id },
                update: value,
                create: {
                  value: value.value,
                  customFieldId: value.customFieldId,
                  contactId: value.contactId,
                },
              })),
            }
          : undefined,
      },
      include: { customValue: true },
    });

    return updatedContact;
  }

  @HandleExceptions()
  async delete(id: number): Promise<ContactDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    return this.db.contact.delete({
      where: whereClause,
      include: { customValue: true },
    });
  }
}
