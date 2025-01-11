import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CampaignRuleDto } from '../dto/campaign-rule.dto';
import { CreateCampaignRuleDto } from '../dto/create-campaign-rule.dto';
import { UpdateCampaignRuleDto } from '../dto/update-campaign-rule.dto';

@Injectable()
export class CampaignRuleService {
  constructor(private readonly db: PrismaService) {}

  async get(campaignId: number): Promise<CampaignRuleDto[]> {
    return this.db.campaignRule.findMany({
      where: {
        campaignId,
      },
    });
  }

  async getById(id: number): Promise<CampaignRuleDto> {
    return this.db.campaignRule.findUnique({ where: { id } });
  }

  async create(data: CreateCampaignRuleDto): Promise<CampaignRuleDto> {
    return this.db.campaignRule.create({ data });
  }

  async update(
    id: number,
    data: UpdateCampaignRuleDto,
  ): Promise<CampaignRuleDto> {
    return this.db.campaignRule.update({ where: { id }, data });
  }

  async delete(id: number): Promise<CampaignRuleDto> {
    return this.db.campaignRule.delete({ where: { id } });
  }
}
