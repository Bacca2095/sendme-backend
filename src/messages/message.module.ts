import { Module } from '@nestjs/common';

import { MessageController } from './controllers/message.controller';
import { MessageTransformService } from './providers/message-transform.service';
import { MessageService } from './providers/message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageTransformService],
})
export class MessageModule {}
