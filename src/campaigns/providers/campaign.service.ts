import { Injectable } from '@nestjs/common';
import { RRule } from 'rrule';

import { PrismaService } from '@/shared/providers/prisma.service';

import { CampaignDto } from '../dto/campaign.dto';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private readonly db: PrismaService) {}

  async get(): Promise<CampaignDto[]> {
    return this.db.campaign.findMany({
      include: {
        provider: true,
        campaignRules: true,
      },
    });
  }

  async getById(id: number): Promise<CampaignDto> {
    return this.db.campaign.findUnique({
      where: { id },
      include: {
        provider: true,
        campaignRules: true,
      },
    });
  }

  async create(data: CreateCampaignDto): Promise<CampaignDto> {
    const rrule = this.generateRRule(data);

    const campaign = await this.db.campaign.create({
      data: {
        ...data,
        rrule,
        campaignRules: {
          create: data.campaignRules || [],
        },
      },
      include: {
        provider: true,
        campaignRules: true,
      },
    });

    return campaign;
  }

  async update(id: number, data: UpdateCampaignDto): Promise<CampaignDto> {
    const rrule =
      data.frequency || data.days || data.startDate || data.time
        ? this.generateRRule(data)
        : undefined;

    const campaign = await this.db.campaign.update({
      where: { id },
      data: {
        ...data,
        rrule,
        campaignRules: data.campaignRules
          ? {
              deleteMany: {},
              create: data.campaignRules,
            }
          : undefined,
      },
      include: {
        provider: true,
        campaignRules: true,
      },
    });

    return campaign;
  }

  async delete(id: number): Promise<CampaignDto> {
    return this.db.campaign.delete({
      where: { id },
      include: {
        provider: true,
        campaignRules: true,
      },
    });
  }

  private generateRRule(data: CreateCampaignDto | UpdateCampaignDto): string {
    const { frequency, days, startDate, endDate, time } = data;

    const [hour, minute] = time.split(':').map(Number);

    const rule = new RRule({
      freq: RRule[frequency],
      byweekday: days.map((day) => RRule[day]),
      dtstart: new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        hour,
        minute,
      ),
      until: endDate || undefined,
    });

    return rule.toString();
  }
}
