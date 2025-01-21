import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BatchMessageDto } from '../dto/batch-message.dto';
import { MessageService } from '../providers/message.service';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly messageService: MessageService) {}

  @Post('send-batch/:apiKey')
  async sendBatchMessages(
    @Param('apiKey') apiKey: string,
    @Body() batchMessageDto: BatchMessageDto,
  ) {
    this.logger.log('Received request to send batch messages.');

    const results = await this.messageService.sendMessages(
      apiKey,
      batchMessageDto,
    );
    return { success: true, data: results };
  }
}
