import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { CampaignRuleDto } from './campaign-rule.dto';

export class CreateCampaignRuleDto extends OmitType(CampaignRuleDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'campaignId',
]) {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  campaignId: number;
}
