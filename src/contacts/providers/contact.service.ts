import { Injectable } from '@nestjs/common';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { PrismaService } from '@/shared/providers/prisma.service';

import { ContactDto } from '../dto/contact.dto';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly db: PrismaService) {}

  @HandleExceptions()
  async get(): Promise<ContactDto[]> {
    return this.db.contact.findMany({ include: { customValue: true } });
  }

  @HandleExceptions()
  async getById(id: number): Promise<ContactDto> {
    return this.db.contact.findUnique({
      where: { id },
      include: { customValue: true },
    });
  }

  @HandleExceptions()
  async create(data: CreateContactDto): Promise<ContactDto> {
    const { customValue } = data;
    return this.db.contact.create({
      data: {
        ...data,
        customValue: customValue
          ? customValue
            ? { createMany: { data: customValue } }
            : undefined
          : undefined,
      },
      include: { customValue: true },
    });
  }

  @HandleExceptions()
  async update(id: number, data: UpdateContactDto): Promise<ContactDto> {
    const { customValue } = data;
    const updatedContact = await this.db.contact.update({
      where: { id },
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
    return this.db.contact.delete({
      where: { id },
      include: { customValue: true },
    });
  }
}
