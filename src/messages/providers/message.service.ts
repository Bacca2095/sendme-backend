import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Queue } from 'bullmq';

import { PrismaService } from '@/shared/providers/prisma.service';

import { BatchMessageDto } from '../dto/batch-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly db: PrismaService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  private async validateApiKeyAndGetOrganizationId(
    apiKey: string,
  ): Promise<number> {
    const organization = await this.db.organization.findFirst({
      where: { apiKey },
    });

    if (!organization) {
      this.logger.error(`Invalid API key: ${apiKey}`);
      throw new UnauthorizedException('Invalid API key');
    }

    return organization.id;
  }

  async enqueueMessages(apiKey: string, data: BatchMessageDto): Promise<void> {
    const { contacts, message } = data;

    this.logger.log(`Enqueuing ${contacts.length} messages for channel: sms`);

    const organizationId =
      await this.validateApiKeyAndGetOrganizationId(apiKey);

    const sentMessages = await Promise.all(
      contacts.map(async (contact) => {
        const newMessage = await this.db.sentMessage.create({
          data: {
            organizationId,
            content: message,
            contentType: 'plain_text',
            recipientDetails: contact,
            status: 'queued',
            deliveryStatus: 'pending',
          },
        });

        return {
          id: newMessage.id.toString(),
          recipient: contact,
          content: message,
          country: data.country,
          channel: 'sms',
          organizationId,
        };
      }),
    );

    await this.messageQueue.add('send-messages', {
      sentMessages,
      channel: 'sms',
    });
    this.logger.log(
      `Successfully enqueued ${sentMessages.length} messages for channel: sms.`,
    );
  }
}
