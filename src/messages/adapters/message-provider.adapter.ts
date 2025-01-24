import { MessageProviderDto } from '@/message-providers/dto/message-provider.dto';

import { SendMessageInput } from '../interfaces/send-message-input.interface';
import { SentMessageOutput } from '../interfaces/send-message-output.interface';

export abstract class MessageProviderAdapter {
  abstract sendSingleMessage(
    input: SendMessageInput,
    provider: MessageProviderDto,
  ): Promise<SentMessageOutput>;

  abstract sendBatchMessages(
    inputs: SendMessageInput[],
    provider: MessageProviderDto,
  ): Promise<{
    sentMessages: SentMessageOutput[];
    failedMessages: SendMessageInput[];
  }>;

  abstract getMessageStatus(
    messageId: string,
    provider: MessageProviderDto,
  ): Promise<SentMessageOutput>;
}
