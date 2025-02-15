import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Subscription } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber } from 'class-validator';

export class SubscriptionDto implements Subscription {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ enum: $Enums.SubscriptionStatus })
  @IsEnum($Enums.SubscriptionStatus)
  status: $Enums.SubscriptionStatus;

  @ApiProperty()
  @IsNumber()
  organizationId: number;

  @ApiProperty()
  @IsNumber()
  planId: number;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiProperty()
  @IsDateString()
  nextResetDate: Date;

  @ApiProperty()
  @IsNumber()
  messageUsage: number;

  @ApiProperty()
  @IsNumber()
  campaignLimit: number;

  @ApiProperty()
  @IsNumber()
  contactLimit: number;

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
