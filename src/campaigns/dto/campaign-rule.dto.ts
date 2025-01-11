import { ApiProperty } from '@nestjs/swagger';
import { $Enums, CampaignRule } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { IsDateString, IsEnum, IsNumber } from 'class-validator';

export class CampaignRuleDto implements CampaignRule {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({
    enum: $Enums.ConditionType,
  })
  @IsEnum($Enums.ConditionType)
  conditionType: $Enums.ConditionType;

  @ApiProperty()
  value: JsonValue;

  @ApiProperty()
  @IsNumber()
  campaignId: number;

  @ApiProperty()
  @IsNumber()
  customFieldId: number;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @IsDateString()
  deletedAt: Date;
}
