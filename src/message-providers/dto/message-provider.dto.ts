import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class EndpointConfigDto {
  @IsUrl()
  url: string;

  @IsString()
  method: string;
}

export class ProviderConfigDto {
  webhookMapping: Record<string, string>;
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => EndpointConfigDto)
  @IsOptional()
  statusEndpoint?: EndpointConfigDto;

  @ValidateNested()
  @Type(() => EndpointConfigDto)
  @IsOptional()
  sendSingleMessageEndpoint?: EndpointConfigDto;

  @ValidateNested()
  @Type(() => EndpointConfigDto)
  @IsOptional()
  sendBatchMessageEndpoint?: EndpointConfigDto;

  @IsObject()
  headers: Record<string, string>;

  @IsObject()
  @IsOptional()
  defaultPayload?: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  priority?: number;
}
export class MessageProviderDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ProviderConfigDto)
  config: ProviderConfigDto;

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
}
