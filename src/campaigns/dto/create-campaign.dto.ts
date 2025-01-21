import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, CampaignStatus, ContentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateCampaignRuleDto } from './create-campaign-rule.dto';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty()
  @IsString()
  time: string;

  @ApiProperty({
    enum: $Enums.Weekday,
  })
  @IsEnum($Enums.Weekday, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  days: $Enums.Weekday[];

  @ApiProperty({
    description: 'The frequency of the campaign',
    enum: $Enums.Frequency,
  })
  @IsEnum($Enums.Frequency)
  frequency: $Enums.Frequency;

  @ApiProperty()
  @IsInt()
  channelId: number;

  @ApiProperty()
  @IsInt()
  organizationId: number;

  @ApiPropertyOptional({ type: [CreateCampaignRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateCampaignRuleDto)
  @IsArray()
  @IsOptional()
  campaignRules?: CreateCampaignRuleDto[];
}
