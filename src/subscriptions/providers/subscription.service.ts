import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/providers/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly db: PrismaService) {}

  async getById(id: number) {
    return this.db.subscription.findUnique({ where: { id } });
  }

  async get() {
    return this.db.subscription.findMany();
  }

  async create(data: any) {
    return this.db.subscription.create({ data });
  }

  async update(id: number, data: any) {
    return this.db.subscription.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.db.subscription.delete({ where: { id } });
  }
}
