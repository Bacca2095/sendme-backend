import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CampaignDto } from '../dto/campaign.dto';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private readonly db: PrismaService) {}

  async get(): Promise<CampaignDto[]> {
    return this.db.campaign.findMany();
  }

  async getById(id: number): Promise<CampaignDto> {
    return this.db.campaign.findUnique({ where: { id } });
  }

  async create(data: CreateCampaignDto): Promise<CampaignDto> {
    return this.db.campaign.create({ data });
  }

  async update(id: number, data: UpdateCampaignDto): Promise<CampaignDto> {
    return this.db.campaign.update({ where: { id }, data });
  }

  async delete(id: number): Promise<CampaignDto> {
    return this.db.campaign.delete({ where: { id } });
  }
}
