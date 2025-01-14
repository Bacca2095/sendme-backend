import { Module } from '@nestjs/common';

import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionService } from './providers/subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
