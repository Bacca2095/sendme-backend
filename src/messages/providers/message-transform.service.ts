import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { flatten, get, isArray, set } from 'lodash';

import { MessageProviderConfigDto } from '@/message-providers/dto/config-message-provider.dto';

import { SendMessageInput } from '../interfaces/send-message-input.interface';
import { SentMessageOutput } from '../interfaces/send-message-output.interface';

@Injectable()
export class MessageTransformService {
  private readonly logger = new Logger(MessageTransformService.name);

  private mapFields(mapping, data, _isBatch = false) {
    const mappedData = Object.keys(mapping).reduce((result, key) => {
      const fieldMapping = mapping[key];
      if (
        typeof fieldMapping === 'string' ||
        typeof fieldMapping === 'number'
      ) {
        result[key] = fieldMapping;
      } else if (fieldMapping.type === 'array') {
        const arrayData = isArray(data)
          ? data.map((item) => this.mapFields(fieldMapping.mapping, item))
          : [];
        result[key] = arrayData;
      } else if (fieldMapping.type === 'object') {
        result[key] = this.mapFields(
          fieldMapping.mapping,
          get(data, fieldMapping.field, {}),
        );
      } else {
        result[key] = get(
          data,
          fieldMapping.field,
          fieldMapping.default || null,
        );
      }
      return result;
    }, {});
    return mappedData;
  }

  private createPayload(
    mapping: Record<string, any>,
    data: Record<string, any>,
    isBatch: boolean = false,
  ): Record<string, any> {
    const payload = this.mapFields(mapping, data);

    if (isBatch) {
      Object.keys(mapping).forEach((key) => {
        const fieldMapping = mapping[key];
        if (fieldMapping.type === 'array' && fieldMapping.mapping) {
          payload[key] = data.map((item: any) =>
            this.mapFields(fieldMapping.mapping, item),
          );
        }
      });
    }

    return payload;
  }

  private async sendRequest(
    url: string,
    method: string,
    payload: Record<string, any>,
    headers: Record<string, string>,
  ) {
    this.logger.warn(
      `Sending request to ${url} with payload: ${JSON.stringify(payload)}`,
    );

    try {
      const response = await axios({
        url,
        method,
        headers,
        data: payload,
      });

      if (response.data && response.data.status < 0) {
        throw new Error(
          `Provider Error: ${response.data.reason || 'Unknown Error'} (Status: ${response.data.status})`,
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send request: ${error['message']}`,
        error['stack'],
      );
      throw error;
    }
  }

  private mapResponse(
    config: Record<string, unknown>,
    endpoint: string,
    response: Record<string, unknown>,
    inputs: SendMessageInput[],
  ): SentMessageOutput | SentMessageOutput[] {
    const responseMapping = config.endpoints[endpoint]?.responseMapping;

    if (!responseMapping) {
      throw new Error(`Response mapping not defined for endpoint: ${endpoint}`);
    }

    const mapping = get(responseMapping, 'messages.mapping');
    const statusMap = get(responseMapping, 'statusMap');

    const createMessage = (
      source: Record<string, unknown>,
      input: SendMessageInput,
    ) => {
      const message: Record<string, unknown> = { providerRawResponse: source };

      Object.keys(mapping).forEach((mappingKey) => {
        const field = mapping[mappingKey]?.field;
        const value = get(source, field, get(input, mappingKey));
        set(message, mappingKey, value);
      });

      const rawStatus = get(message, 'status');
      const mappedStatus = get(statusMap, `${rawStatus}`, 'unknown');

      set(message, 'status', mappedStatus);

      // Asegurarnos de que el ID esté presente
      if (!message['id'] && input?.id) {
        message['id'] = input.id;
      }

      return message as unknown as SentMessageOutput;
    };

    const messageType = get(responseMapping, 'messages.type');

    if (messageType === 'object') {
      return createMessage(response, inputs[0]);
    }

    if (messageType === 'array') {
      const paths = get(responseMapping, 'messages.paths');
      const mergedArray = flatten(
        paths.map((path: string) => get(response, path, [])),
      );

      return mergedArray.map((item, index) =>
        createMessage(item as Record<string, unknown>, inputs[index]),
      );
    }

    return [];
  }

  public async handleBatch(
    providerConfig: MessageProviderConfigDto,
    inputs: SendMessageInput[],
  ): Promise<SentMessageOutput[]> {
    const headers = providerConfig.headers;

    if (!providerConfig.endpoints.sendBatchMessage) {
      this.logger.warn(
        'sendBatchMessage not configured, processing messages individually.',
      );

      const results: SentMessageOutput[] = [];
      for (const input of inputs) {
        const result = await this.handleSingle(providerConfig, input);
        results.push(result);
      }
      return results;
    }

    const payload = this.createPayload(
      providerConfig.endpoints.sendBatchMessage.requestBodyMapping,
      inputs,
      true,
    );

    try {
      const rawResponse = await this.sendRequest(
        providerConfig.endpoints.sendBatchMessage.url,
        providerConfig.endpoints.sendBatchMessage.httpMethod,
        payload,
        headers as any,
      );

      return this.mapResponse(
        providerConfig as any,
        'sendBatchMessage',
        rawResponse,
        inputs,
      ) as SentMessageOutput[];
    } catch (error) {
      this.logger.error(
        `Failed to send batch messages: ${error['message']}`,
        error['stack'],
      );
      throw error;
    }
  }

  public async handleSingle(
    providerConfig: MessageProviderConfigDto,
    input: SendMessageInput,
  ): Promise<SentMessageOutput> {
    const headers = providerConfig.headers;

    if (!providerConfig.endpoints.sendMessage) {
      this.logger.warn(
        'sendMessage not configured, attempting with sendBatchMessage.',
      );

      const batchResult = await this.handleBatch(providerConfig, [input]);
      return batchResult[0];
    }

    const payload = this.createPayload(
      providerConfig.endpoints.sendMessage.requestBodyMapping,
      input,
    );

    try {
      const rawResponse = await this.sendRequest(
        providerConfig.endpoints.sendMessage.url,
        providerConfig.endpoints.sendMessage.httpMethod,
        payload,
        headers as any,
      );

      const normalizedResponse = this.mapResponse(
        providerConfig as any,
        'sendMessage',
        rawResponse,
        [input],
      );

      return normalizedResponse as SentMessageOutput;
    } catch (error) {
      this.logger.error(
        `Failed to send single message: ${error['message']}`,
        error['stack'],
      );
      throw error;
    }
  }
}
