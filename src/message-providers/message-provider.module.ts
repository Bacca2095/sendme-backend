import { Module } from '@nestjs/common';

import { MessageProviderController } from './controllers/message-provider.controller';
import { MessageProviderService } from './providers/message-provider.service';

@Module({
  controllers: [MessageProviderController],
  providers: [MessageProviderService],
})
export class MessageProviderModule {}
