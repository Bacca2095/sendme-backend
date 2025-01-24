import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { MessageProviderDto } from '@/message-providers/dto/message-provider.dto';

import { MessageProviderAdapter } from './message-provider.adapter';
import { SendMessageInput } from '../interfaces/send-message-input.interface';
import { SentMessageOutput } from '../interfaces/send-message-output.interface';

@Injectable()
export class AldeamoProviderAdapter implements MessageProviderAdapter {
  private readonly logger = new Logger(AldeamoProviderAdapter.name);

  constructor(private readonly httpService: HttpService) {}
  getMessageStatus(
    _messageId: string,
    _provider: MessageProviderDto,
  ): Promise<SentMessageOutput> {
    throw new Error('Method not implemented.');
  }

  async sendBatchMessages(
    inputs: SendMessageInput[],
    providerConfig: MessageProviderDto,
  ): Promise<{
    sentMessages: SentMessageOutput[];
    failedMessages: SendMessageInput[];
  }> {
    this.logger.log(`Sending batch messages to Aldeamo.`);

    const payload = {
      country: inputs[0].country,
      message: inputs[0].content,
      encoding: 'UTF-8',
      addresseeList: inputs.map((input) => ({
        mobile: input.recipient,
        message: input.content,
        correlationLabel: input.id,
      })),
      messageFormat: 1,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          providerConfig.config.sendBatchMessageEndpoint.url,
          payload,
          {
            headers: providerConfig.config.headers,
          },
        ),
      );

      this.logger.log(
        `Aldeamo response received: ${JSON.stringify(response.data)}`,
      );
      return this.processBatchResponse(response.data, inputs);
    } catch (error) {
      this.logger.error(
        `Failed to send batch messages to Aldeamo: ${error['message']}`,
      );
      throw error;
    }
  }

  private processBatchResponse(
    response: any,
    inputs: SendMessageInput[],
  ): { sentMessages: SentMessageOutput[]; failedMessages: SendMessageInput[] } {
    const sentMessages: SentMessageOutput[] = [];
    const failedMessages: SendMessageInput[] = [];

    const receivedRequests = response.result?.receivedRequests || [];
    const failedRequests = response.result?.failedRequests || [];

    // Procesar mensajes exitosos
    receivedRequests.forEach((request: any) => {
      const input = inputs.find((i) => i.recipient === request.mobile);

      if (!input) {
        this.logger.warn(
          `Received request for unknown recipient: ${request.mobile}`,
        );
        return;
      }

      sentMessages.push({
        id: parseInt(input.id, 10),
        recipientDetails: request.mobile,
        content: input.content,
        status: 'sent',
        sentAt: new Date(response.result.dateToSend),
        deliveryStatus: 'queued',
        deliveryDetails: null,
        providerRawResponse: request,
        messageId: request.transactionId,
        countryCode: input.country,
        priority: 1,
        messageType: 'text',
      });
    });

    // Procesar mensajes fallidos
    failedRequests.forEach((request: any) => {
      const input = inputs.find((i) => i.recipient === request.mobile);

      if (!input) {
        this.logger.warn(
          `Failed request for unknown recipient: ${request.mobile}`,
        );
        return;
      }

      this.logger.warn(
        `Message failed for recipient ${request.mobile}: ${request.reason} (Status: ${request.status})`,
      );

      failedMessages.push({
        ...input,
      });
    });

    return { sentMessages, failedMessages };
  }

  async sendSingleMessage(
    input: SendMessageInput,
    providerConfig: MessageProviderDto,
  ): Promise<SentMessageOutput> {
    const url = providerConfig.config.sendSingleMessageEndpoint.url
      .replace('{mobile}', input.recipient)
      .replace('{country}', input.country)
      .replace('{message}', encodeURIComponent(input.content))
      .replace('{messageFormat}', '1');

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: providerConfig.config.headers,
        }),
      );

      this.logger.log(
        `Aldeamo single message response: ${JSON.stringify(response.data)}`,
      );
      return this.processSingleResponse(response.data, input);
    } catch (error) {
      this.logger.error(
        `Failed to send single message to Aldeamo: ${error['message']}`,
      );
      throw error;
    }
  }

  private processSingleResponse(
    response: any,
    input: SendMessageInput,
  ): SentMessageOutput {
    if (response.status !== 1) {
      this.logger.error(
        `Failed to send single message for recipient ${input.recipient}. Status: ${response.status}, Reason: ${response.reason}`,
      );
      throw new Error(response.reason || 'Unknown error');
    }

    return {
      id: parseInt(input.id, 10),
      recipientDetails: input.recipient,
      content: input.content,
      status: 'sent',
      sentAt: new Date(response.result.dateToSend),
      deliveryStatus: 'queued',
      deliveryDetails: null,
      providerRawResponse: response,
      messageId: response.result.receivedRequests[0]?.transactionId || null,
      countryCode: input.country,
      priority: 1,
      messageType: 'text',
    };
  }
}
