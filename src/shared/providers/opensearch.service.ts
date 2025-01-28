import { Injectable, Logger } from '@nestjs/common';
import { Client, ClientOptions } from '@opensearch-project/opensearch';
import dayjs from 'dayjs';

interface IErrorLog {
  type: string;
  message: string;
  code?: string;
  stackTrace: string;
  timestamp?: string;
  additionalData?: Record<string, any>;
}

@Injectable()
export class OpenSearchService {
  private client: Client;
  private readonly logger = new Logger(OpenSearchService.name);

  constructor() {
    const localOptions: ClientOptions = {
      node: 'http://localhost:9201',
    };

    try {
      this.client = new Client(localOptions);
    } catch (error) {
      this.logger.warn(`Error connecting to OpenSearch client: ${error}`);
    }
  }

  async logError(errorLog: IErrorLog) {
    const date = dayjs().format('YYYY_MM');

    try {
      await this.client.index({
        index: `sendme_error_logs_${date}`,
        body: {
          ...errorLog,
          timestamp: new Date(),
        },
      });
      this.logger.log('Error logged in OpenSearch successfully.');
    } catch (error) {
      this.logger.error(`Error sending data to OpenSearch: ${error}`);
    }
  }
}
