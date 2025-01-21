import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Provider } from '@prisma/client';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CreateMessageProviderDto } from '../dto/create-message-provider.dto';
import { UpdateMessageProviderDto } from '../dto/update-message-provider.dto';

@Injectable()
export class MessageProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMessageProviderDto): Promise<Provider> {
    const existingProvider = await this.prisma.provider.findUnique({
      where: { name: dto.name },
    });

    if (existingProvider) {
      throw new ConflictException(
        `Provider with name '${dto.name}' already exists.`,
      );
    }

    return this.prisma.provider.create({
      data: {
        name: dto.name,
        config: dto.config as unknown as Prisma.JsonObject,
      },
    });
  }

  async update(id: number, dto: UpdateMessageProviderDto): Promise<Provider> {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID '${id}' not found.`);
    }

    return this.prisma.provider.update({
      where: { id },
      data: {
        name: dto.name ?? provider.name,
        config: dto.config
          ? (dto.config as unknown as Prisma.JsonObject)
          : provider.config,
      },
    });
  }

  async getById(id: number): Promise<Provider> {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID '${id}' not found.`);
    }

    return provider;
  }

  async get(): Promise<Provider[]> {
    return this.prisma.provider.findMany();
  }

  async delete(id: number): Promise<void> {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID '${id}' not found.`);
    }

    await this.prisma.provider.delete({
      where: { id },
    });
  }
}
