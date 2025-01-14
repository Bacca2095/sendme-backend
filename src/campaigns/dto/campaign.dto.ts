import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, Campaign } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CampaignRuleDto } from './campaign-rule.dto';

export class CampaignDto implements Campaign {
  @ApiProperty({ enum: $Enums.Frequency })
  @IsEnum($Enums.Frequency)
  frequency: $Enums.Frequency;

  @ApiPropertyOptional({
    enum: $Enums.Weekday,
    description: 'Days of the week when the campaign will be executed',
    example: ['MO', 'TU', 'WE'],
  })
  @IsEnum($Enums.Weekday, { each: true })
  @IsArray()
  days: $Enums.Weekday[];
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: $Enums.ContentType })
  @IsEnum($Enums.ContentType)
  contentType: $Enums.ContentType;

  @ApiProperty({ enum: $Enums.CampaignStatus })
  @IsEnum($Enums.CampaignStatus)
  status: $Enums.CampaignStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate: Date;

  @ApiProperty()
  @IsString()
  time: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rrule: string;

  @ApiProperty()
  @IsNumber()
  providerId: number;

  @ApiProperty()
  @IsNumber()
  organizationId: number;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deletedAt: Date;

  @ApiPropertyOptional({ type: [CampaignRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignRuleDto)
  @IsOptional()
  campaignRules?: CampaignRuleDto[];
}
