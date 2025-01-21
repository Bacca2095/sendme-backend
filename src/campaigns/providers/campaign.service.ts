import { Injectable } from '@nestjs/common';
import { RRule } from 'rrule';

import { HandleExceptions } from '@/exceptions/decorators/handle-exceptions.decorator';
import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { CampaignDto } from '../dto/campaign.dto';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    private readonly db: PrismaService,
    private readonly als: AsyncLocalStorageService,
  ) {}

  @HandleExceptions()
  async get(): Promise<CampaignDto[]> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { organizationId } : {};

    return this.db.campaign.findMany({
      where: whereClause,
      include: {
        channel: true,
        campaignRules: true,
      },
    });
  }

  @HandleExceptions()
  async getById(id: number): Promise<CampaignDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    return this.db.campaign.findUnique({
      where: whereClause,
      include: {
        channel: true,
        campaignRules: true,
      },
    });
  }

  @HandleExceptions()
  async create(data: CreateCampaignDto): Promise<CampaignDto> {
    const organizationId = this.als.getValidatedOrganizationId(
      data.organizationId,
    );

    if (!organizationId) {
      throw new Error('Organization ID is required for this operation.');
    }

    const rrule = this.generateRRule(data);

    const campaign = await this.db.campaign.create({
      data: {
        ...data,
        organizationId,
        rrule,
        campaignRules: {
          create: data.campaignRules || [],
        },
      },
      include: {
        channel: true,
        campaignRules: true,
      },
    });

    return campaign;
  }

  @HandleExceptions()
  async update(id: number, data: UpdateCampaignDto): Promise<CampaignDto> {
    const organizationId = this.als.getValidatedOrganizationId();

    const currentCampaign = await this.db.campaign.findUnique({
      where: { id },
    });

    const rrule =
      data.frequency || data.days || data.startDate || data.time || data.endDate
        ? this.generateRRule({ ...currentCampaign, ...data })
        : undefined;

    const campaign = await this.db.campaign.update({
      where: { id, organizationId },
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
        channel: true,
        campaignRules: true,
      },
    });

    return campaign;
  }

  @HandleExceptions()
  async delete(id: number): Promise<CampaignDto> {
    const organizationId = this.als.getValidatedOrganizationId();
    const whereClause = organizationId ? { id, organizationId } : { id };

    return this.db.campaign.delete({
      where: whereClause,
      include: {
        channel: true,
        campaignRules: true,
      },
    });
  }

  private generateRRule(data: CreateCampaignDto | UpdateCampaignDto): string {
    const { frequency, days, startDate, endDate, time } = data;

    const [hour, minute] = time.split(':').map(Number);

    const dtStart = new Date(startDate);
    dtStart.setUTCHours(hour, minute, 0, 0);

    const dtUntil = endDate ? new Date(endDate) : undefined;
    if (dtUntil) {
      dtUntil.setUTCHours(23, 59, 59, 0);
    }

    const rule = new RRule({
      freq: RRule[frequency],
      byweekday: days.map((day) => RRule[day]),
      dtstart: dtStart,
      until: dtUntil,
    });

    const rruleString = rule.toString();

    return rruleString;
  }
}
