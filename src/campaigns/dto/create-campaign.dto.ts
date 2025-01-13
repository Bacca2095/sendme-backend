import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, ContentType } from '@prisma/client';
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
    description: 'Days of the week when the campaign will be executed',
    type: [String],
    example: ['monday', 'wednesday', 'friday'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  days: string[];

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
