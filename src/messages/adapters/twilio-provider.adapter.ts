import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { MessageProviderDto } from '@/message-providers/dto/message-provider.dto';

import { MessageProviderAdapter } from './message-provider.adapter';
import { SendMessageInput } from '../interfaces/send-message-input.interface';
import { SentMessageOutput } from '../interfaces/send-message-output.interface';

@Injectable()
export class TwilioProviderAdapter extends MessageProviderAdapter {
  private readonly logger = new Logger(TwilioProviderAdapter.name);

  constructor(private readonly httpService: HttpService) {
    super();
  }

  /**
   * Send a single message using Twilio's API.
   */
  async sendSingleMessage(
    input: SendMessageInput,
    provider: MessageProviderDto,
  ): Promise<SentMessageOutput> {
    const payload = {
      ...provider.config.defaultPayload,
      To: `+${input.country}${input.recipient}`,
      Body: input.content,
    };

    try {
      this.logger.log(
        `Sending single message to Twilio for ${input.recipient}`,
      );
      const response = await lastValueFrom(
        this.httpService.post(
          provider.config.sendSingleMessageEndpoint.url,
          new URLSearchParams(payload),
          {
            headers: provider.config.headers,
          },
        ),
      );

      const responseData = response.data;
      return {
        id: parseInt(input.id, 10),
        recipientDetails: responseData.to,
        content: responseData.body,
        status: responseData.status,
        sentAt: new Date(responseData.date_created),
        deliveryStatus: responseData.status,
        deliveryDetails: null,
        providerRawResponse: responseData,
        messageId: responseData.sid,
        countryCode: input.country,
        priority: 1,
        messageType: 'text',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send message to ${input.recipient}: ${error['message']}`,
      );
      throw new Error(`Failed to send message: ${error['message']}`);
    }
  }

  /**
   * Send multiple messages using Twilio's API by invoking single message API multiple times.
   */
  async sendBatchMessages(
    inputs: SendMessageInput[],
    provider: MessageProviderDto,
  ): Promise<{
    sentMessages: SentMessageOutput[];
    failedMessages: SendMessageInput[];
  }> {
    const sentMessages: SentMessageOutput[] = [];
    const failedMessages: SendMessageInput[] = [];

    this.logger.log(
      `Sending batch messages to Twilio (count: ${inputs.length})`,
    );

    for (const input of inputs) {
      try {
        const result = await this.sendSingleMessage(input, provider);
        sentMessages.push(result);
      } catch (error) {
        this.logger.warn(
          `Message to ${input.recipient} failed: ${error['message']}`,
        );
        failedMessages.push(input);
      }
    }

    return { sentMessages, failedMessages };
  }

  /**
   * Fetch the status of a message from Twilio's API.
   */
  async getMessageStatus(
    messageId: string,
    provider: MessageProviderDto,
  ): Promise<SentMessageOutput> {
    const url = provider.config.statusEndpoint.url.replace(
      '{messageId}',
      messageId,
    );

    try {
      this.logger.log(`Fetching status for message ID: ${messageId}`);
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: provider.config.headers,
        }),
      );

      const responseData = response.data;

      return {
        id: null, // ID no disponible en esta respuesta
        recipientDetails: responseData.to || null,
        content: responseData.body || null,
        status: responseData.status,
        sentAt: new Date(responseData.date_created),
        deliveryStatus: responseData.status,
        deliveryDetails: responseData.error_message || null,
        providerRawResponse: responseData,
        messageId: responseData.sid,
        countryCode: null, // Código de país no disponible en esta respuesta
        priority: 1,
        messageType: 'text',
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch message status for ${messageId}: ${error['message']}`,
      );
      throw new Error(
        `Failed to fetch message status for ${messageId}: ${error['message']}`,
      );
    }
  }
}
