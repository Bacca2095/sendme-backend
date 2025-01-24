import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { CampaignController } from './controllers/campaign.controller';
import { CampaignCronService } from './crons/campaign-cron.service';
import { CampaignService } from './providers/campaign.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignCronService],
})
export class CampaignModule {}
