import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

import { PrismaService } from '@/shared/providers/prisma.service';

interface CampaignRule {
  conditionType: string;
  value: any;
  customFieldId: number;
}

interface Contact {
  id: number;
  name: string;
  lastName?: string;
  birthDate?: Date;
  email?: string;
  phone?: string;
  countryCode?: string;
  customValue?: Array<{ customFieldId: number; value: any }>;
}

@Injectable()
export class CampaignCronService {
  private readonly logger = new Logger(CampaignCronService.name);

  constructor(
    private readonly db: PrismaService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledCampaigns(): Promise<void> {
    this.logger.log('Checking for scheduled campaigns to process...');

    const campaigns = await this.db.campaign.findMany({
      where: {
        status: 'active',
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        campaignRules: true,
        organization: true,
      },
    });

    if (campaigns.length === 0) {
      this.logger.log('No scheduled campaigns to process.');
      return;
    }

    for (const campaign of campaigns) {
      try {
        this.logger.log(`Processing campaign ID: ${campaign.id}`);

        const contacts = await this.db.contact.findMany({
          where: { organizationId: campaign.organizationId },
          include: {
            customValue: true,
          },
        });

        if (contacts.length === 0) {
          this.logger.warn(
            `No contacts found for organization ID ${campaign.organizationId}.`,
          );
          continue;
        }

        const eligibleContacts = contacts.filter((contact) =>
          this.evaluateRules(contact, campaign.campaignRules),
        );

        if (eligibleContacts.length === 0) {
          this.logger.warn(
            `No eligible contacts found for campaign ID ${campaign.id}.`,
          );
          continue;
        }

        this.logger.log(
          `Found ${eligibleContacts.length} eligible contacts for campaign ID ${campaign.id}.`,
        );

        const messages = eligibleContacts.map((contact) => ({
          content: campaign.content,
          recipient: contact.phone,
          country: contact.countryCode,
          organizationId: campaign.organizationId,
          campaignId: campaign.id,
        }));

        await this.messageQueue.add('send-messages', {
          sentMessages: messages,
          channel: 'sms',
        });

        this.logger.log(`Messages scheduled for campaign ID ${campaign.id}.`);
      } catch (error) {
        this.logger.error(
          `Error processing campaign ID ${campaign.id}: ${error['message']}`,
        );
      }
    }

    this.logger.log('Finished processing scheduled campaigns.');
  }

  private evaluateRules(contact: Contact, rules: CampaignRule[]): boolean {
    for (const rule of rules) {
      const customValue = contact.customValue?.find(
        (cv) => cv.customFieldId === rule.customFieldId,
      );

      if (!customValue) {
        this.logger.warn(
          `Contact ${contact.id} does not have a value for customFieldId ${rule.customFieldId}.`,
        );
        return false;
      }

      const isValid = this.evaluateCondition(
        rule.conditionType,
        customValue.value,
        rule.value,
      );

      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  private evaluateCondition(
    conditionType: string,
    contactValue: any,
    ruleValue: any,
  ): boolean {
    switch (conditionType) {
      case 'equals':
        return contactValue === ruleValue;
      case 'not_equals':
        return contactValue !== ruleValue;
      case 'contains':
        return Array.isArray(contactValue) && contactValue.includes(ruleValue);
      case 'greater_than':
        return contactValue > ruleValue;
      case 'less_than':
        return contactValue < ruleValue;
      case 'starts_with':
        return (
          typeof contactValue === 'string' && contactValue.startsWith(ruleValue)
        );
      case 'ends_with':
        return (
          typeof contactValue === 'string' && contactValue.endsWith(ruleValue)
        );
      case 'is_empty':
        return !contactValue || contactValue.length === 0;
      case 'not_empty':
        return !!contactValue && contactValue.length > 0;
      default:
        this.logger.warn(`Unsupported condition type: ${conditionType}`);
        return false;
    }
  }
}
