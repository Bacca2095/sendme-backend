import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CreatePlanDto } from '../dto/create-plan.dto';
import { PlanDto } from '../dto/plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private readonly db: PrismaService) {}

  async get(): Promise<PlanDto[]> {
    return this.db.plan.findMany();
  }

  async getById(id: number): Promise<PlanDto> {
    return this.db.plan.findUnique({ where: { id } });
  }

  async getByName(name: string): Promise<PlanDto> {
    return this.db.plan.findFirst({ where: { name } });
  }

  async create(data: CreatePlanDto): Promise<PlanDto> {
    return this.db.plan.create({ data });
  }

  async update(id: number, data: UpdatePlanDto): Promise<PlanDto> {
    return this.db.plan.update({ where: { id }, data });
  }

  async delete(id: number): Promise<PlanDto> {
    return this.db.plan.delete({ where: { id } });
  }
}
