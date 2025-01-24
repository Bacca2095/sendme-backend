import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { get } from 'lodash';
import { lastValueFrom } from 'rxjs';

import { MessageProviderDto } from '@/message-providers/dto/message-provider.dto';

import { MessageProviderAdapter } from './message-provider.adapter';
import { SendMessageInput } from '../interfaces/send-message-input.interface';
import { SentMessageOutput } from '../interfaces/send-message-output.interface';

@Injectable()
export class JeSolutionsProviderAdapter extends MessageProviderAdapter {
  private readonly logger = new Logger(JeSolutionsProviderAdapter.name);

  constructor(private readonly httpService: HttpService) {
    super();
  }

  async sendSingleMessage(
    input: SendMessageInput,
    provider: MessageProviderDto,
  ): Promise<SentMessageOutput> {
    const payload = {
      SenderId: provider.config.defaultPayload.SenderId,
      Is_Unicode: provider.config.defaultPayload.Is_Unicode,
      Is_Flash: provider.config.defaultPayload.Is_Flash,
      ApiKey: provider.config.defaultPayload.ApiKey,
      ClientId: provider.config.defaultPayload.ClientId,
      Message: input.content,
      MobileNumbers: `${input.country}${input.recipient}`,
    };

    this.logger.log(
      `Sending single message to JeSolutions for ${input.recipient}`,
    );

    const response = await lastValueFrom(
      this.httpService.post(
        provider.config.sendSingleMessageEndpoint.url,
        payload,
        { headers: provider.config.headers },
      ),
    );

    const responseData = response.data;

    // Validar si el ErrorCode no es 0
    if (responseData.ErrorCode !== 0) {
      this.logger.error(
        `Failed to send single message. ErrorCode: ${responseData.ErrorCode}, Reason: ${responseData.ErrorDescription}`,
      );
      throw new Error(
        `Failed to send message: ${responseData.ErrorDescription} (ErrorCode: ${responseData.ErrorCode})`,
      );
    }

    return {
      id: parseInt(input.id, 10),
      recipientDetails: input.recipient,
      content: input.content,
      status: 'queued',
      sentAt: new Date(),
      deliveryStatus: 'queued',
      deliveryDetails: responseData.ErrorDescription,
      providerRawResponse: responseData,
      messageId: responseData.Data?.[0]?.MessageId || null,
      countryCode: input.country,
      priority: 1,
      messageType: 'text',
    };
  }

  async sendBatchMessages(
    inputs: SendMessageInput[],
    provider: MessageProviderDto,
  ): Promise<{
    sentMessages: SentMessageOutput[];
    failedMessages: SendMessageInput[];
  }> {
    const messageParameters = inputs.map((input) => ({
      Number: `${input.country}${input.recipient}`,
      Text: input.content,
    }));

    const payload = {
      SenderId: provider.config.defaultPayload.SenderId,
      Is_Unicode: provider.config.defaultPayload.Is_Unicode,
      Is_Flash: provider.config.defaultPayload.Is_Flash,
      ApiKey: provider.config.defaultPayload.ApiKey,
      ClientId: provider.config.defaultPayload.ClientId,
      MessageParameters: messageParameters,
    };

    this.logger.log(
      `Sending batch messages to JeSolutions (count: ${inputs.length})`,
    );

    const response = await lastValueFrom(
      this.httpService.post(
        provider.config.sendBatchMessageEndpoint.url,
        payload,
        { headers: provider.config.headers },
      ),
    );

    const responseData = response.data;

    // Validar si el ErrorCode no es 0
    if (responseData.ErrorCode !== 0) {
      this.logger.error(
        `Failed to send batch messages. ErrorCode: ${responseData.ErrorCode}, Reason: ${responseData.ErrorDescription}`,
      );
      throw new Error(
        `Failed to send batch messages: ${responseData.ErrorDescription} (ErrorCode: ${responseData.ErrorCode})`,
      );
    }

    const sentMessages: SentMessageOutput[] = [];
    const failedMessages: SendMessageInput[] = [];

    // Procesar mensajes enviados y fallidos
    inputs.forEach((input, index) => {
      const messageData = responseData.Data[index];

      if (messageData) {
        sentMessages.push({
          id: parseInt(input.id, 10),
          recipientDetails: messageData.MobileNumber,
          content: input.content,
          status: 'queued',
          sentAt: new Date(),
          deliveryStatus: 'queued',
          deliveryDetails: null,
          providerRawResponse: responseData,
          messageId: messageData.MessageId,
          countryCode: input.country,
          priority: 1,
          messageType: 'text',
        });
      } else {
        failedMessages.push(input);
        this.logger.warn(`Message failed for recipient: ${input.recipient}`);
      }
    });

    return { sentMessages, failedMessages };
  }

  async getMessageStatus(
    messageId: string,
    provider: MessageProviderDto,
  ): Promise<SentMessageOutput> {
    const url = provider.config.statusEndpoint.url
      .replace(
        '{ApiKey}',
        get(provider, 'config.defaultPayload.ApiKey') as string,
      )
      .replace(
        '{ClientId}',
        get(provider, 'config.defaultPayload.ClientId') as string,
      )
      .replace('{MessageId}', messageId);

    this.logger.log(`Fetching status for message ID: ${messageId}`);

    const response = await lastValueFrom(
      this.httpService.get(url, { headers: provider.config.headers }),
    );

    const responseData = response.data;

    // Validar si el ErrorCode no es 0
    if (responseData.ErrorCode !== 0) {
      this.logger.error(
        `Failed to fetch message status. ErrorCode: ${responseData.ErrorCode}, Reason: ${responseData.ErrorDescription}`,
      );
      throw new Error(
        `Failed to fetch message status: ${responseData.ErrorDescription} (ErrorCode: ${responseData.ErrorCode})`,
      );
    }

    return {
      id: null,
      recipientDetails: responseData.Data.MobileNumber,
      content: responseData.Data.Message || null,
      status: this.mapStatus(
        provider.config.webhookMapping.status,
        responseData,
      ),
      sentAt: new Date(responseData.Data.SubmitDate),
      deliveryStatus: this.mapStatus(
        provider.config.webhookMapping.status,
        responseData,
      ),
      deliveryDetails: responseData.ErrorDescription,
      providerRawResponse: responseData,
      messageId: responseData.Data.MessageId,
      countryCode: null,
      priority: 1,
      messageType: 'text',
    };
  }

  private mapStatus(mapping: any, payload: any): string {
    const rawStatus = get(payload, mapping.field);
    return mapping.map[rawStatus] || 'unknown';
  }
}
