import { Module } from '@nestjs/common';

import { CampaignController } from './controllers/campaign.controller';
import { CampaignService } from './providers/campaign.service';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}