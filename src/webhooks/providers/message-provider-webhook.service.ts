import { Injectable } from '@nestjs/common';
import { get } from 'lodash';

import { MessageProviderDto } from '@/message-providers/dto/message-provider.dto';
import { SentMessageOutput } from '@/messages/interfaces/send-message-output.interface';
import { PrismaService } from '@/shared/providers/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(
    provider: MessageProviderDto,
    payload: any,
  ): Promise<SentMessageOutput> {
    const { webhookMapping } = provider.config;

    const processedData: Partial<SentMessageOutput> = {
      recipientDetails: this.getFieldValue(webhookMapping.recipient, payload),
      content: this.getFieldValue(webhookMapping.details, payload),
      status: this.mapStatus(webhookMapping.status, payload),
      sentAt: new Date(
        this.getFieldValue(webhookMapping.eventDate, payload) || null,
      ),
      deliveryStatus: this.mapStatus(webhookMapping.status, payload),
      deliveryDetails: payload,
      messageId: this.getFieldValue(webhookMapping.messageId, payload),
      countryCode: null,
      priority: 1,
      messageType: 'text',
    };

    if (processedData.messageId) {
      await this.prisma.sentMessage.updateMany({
        where: { messageId: processedData.messageId },
        data: {
          status: processedData.status as any,
          deliveryStatus: processedData.deliveryStatus,
          deliveryDetails: processedData.deliveryDetails,
          sentAt: processedData.sentAt,
          providerRawResponse: processedData.providerRawResponse,
        },
      });
    }

    return processedData as SentMessageOutput;
  }

  private getFieldValue(mapping: any, payload: any): any {
    return get(payload, mapping.field, mapping.default || null);
  }

  private mapStatus(mapping: any, payload: any): string {
    const rawStatus = get(payload, mapping.field);
    return mapping.map[rawStatus] || 'unknown';
  }
}
