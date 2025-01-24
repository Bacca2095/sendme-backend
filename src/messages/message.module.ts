import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AldeamoProviderAdapter } from './adapters/aldeamo-provider.adapter';
import { JeSolutionsProviderAdapter } from './adapters/theje-soluciones-provider.adapter';
import { TwilioProviderAdapter } from './adapters/twilio-provider.adapter';
import { MessageController } from './controllers/message.controller';
import { MessageQueueProcessor } from './processors/message-queue.processor';
import { MessageService } from './providers/message.service';
import { ProviderFactoryService } from './providers/provider-factory.service';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'message-queue',
    }),
    BullBoardModule.forFeature({
      name: 'message-queue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    TwilioProviderAdapter,
    AldeamoProviderAdapter,
    JeSolutionsProviderAdapter,
    ProviderFactoryService,
    MessageQueueProcessor,
  ],
})
export class MessageModule {}
