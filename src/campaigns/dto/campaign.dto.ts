import { ApiProperty } from '@nestjs/swagger';
import { Campaign } from '@prisma/client';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CampaignDto implements Campaign {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNumber()
  providerId: number;

  @ApiProperty()
  @IsNumber()
  organizationId: number;

  @ApiProperty()
  @IsDateString()
  scheduledAt: Date;

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
