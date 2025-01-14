import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, CampaignStatus, ContentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateCampaignRuleDto } from './create-campaign-rule.dto';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  time: string;

  @ApiProperty({
    enum: $Enums.Weekday,
  })
  @IsEnum($Enums.Weekday, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  days: $Enums.Weekday[];

  @ApiProperty({
    description: 'The frequency of the campaign',
    enum: $Enums.Frequency,
  })
  @IsEnum($Enums.Frequency)
  frequency: $Enums.Frequency;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  providerId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  organizationId: number;

  @ApiPropertyOptional({ type: [CreateCampaignRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateCampaignRuleDto)
  @IsArray()
  @IsOptional()
  campaignRules?: CreateCampaignRuleDto[];
}
