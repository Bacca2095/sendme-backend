import { OmitType } from '@nestjs/swagger';

import { CampaignRuleDto } from './campaign-rule.dto';

export class CreateCampaignRuleDto extends OmitType(CampaignRuleDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}
