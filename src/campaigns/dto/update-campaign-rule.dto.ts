import { PartialType } from '@nestjs/swagger';

import { CreateCampaignRuleDto } from './create-campaign-rule.dto';

export class UpdateCampaignRuleDto extends PartialType(CreateCampaignRuleDto) {}
