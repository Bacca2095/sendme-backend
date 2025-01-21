import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StatusMappingDto {
  @ApiProperty({
    description: 'Key in the webhook payload that holds the status',
    example: 'x_transaction_state',
  })
  @IsString({ message: 'Status key must be a valid string' })
  @IsNotEmpty({ message: 'Status key is required' })
  statusKey: string;

  @ApiProperty({
    description: 'Mapping of provider statuses to internal statuses',
    example: {
      '1': 'accepted',
      '2': 'rejected',
      '3': 'pending',
      '4': 'failed',
    },
  })
  @IsObject({ message: 'Values must be a valid object' })
  @IsNotEmpty({ message: 'Values are required' })
  values: Record<string, string>;
}

export class MappingDetailDto {
  @ApiProperty({
    description: 'Field name in the target model or provider',
    example: 'amount',
    default: 'amount',
  })
  @IsString()
  @IsNotEmpty({ message: 'Field name is required and cannot be empty' })
  field: string;

  @ApiProperty({
    description: 'Data type of the field',
    enum: ['string', 'number', 'boolean', 'date'],
    default: 'number',
  })
  @IsEnum(['string', 'number', 'boolean', 'date'], {
    message: 'Type must be one of: string, number, boolean, date',
  })
  @IsNotEmpty({ message: 'Type is required and cannot be empty' })
  type: string;
}

export class PropertyMappingDto {
  @ApiProperty({
    description: 'Mapping from provider fields to model fields',
    example: {
      x_amount: { field: 'amount', type: 'number' },
    },
  })
  @IsObject({ message: 'toModel must be a valid object' })
  @ValidateNested({ each: true })
  @Type(() => MappingDetailDto)
  @IsDefined({ message: 'toModel is required' })
  toModel: Record<string, MappingDetailDto>;

  @ApiProperty({
    description: 'Mapping from model fields to provider fields',
    example: {
      amount: { field: 'x_amount', type: 'number' },
    },
  })
  @IsObject({ message: 'toProvider must be a valid object' })
  @ValidateNested({ each: true })
  @Type(() => MappingDetailDto)
  @IsDefined({ message: 'toProvider is required' })
  toProvider: Record<string, MappingDetailDto>;
}

export class HashConfigDto {
  @ApiProperty({
    description: 'Hash type used for signature validation',
    enum: ['sha256', 'md5'],
  })
  @IsEnum(['sha256', 'md5'], {
    message: 'Hash type must be one of: sha256, md5',
  })
  @IsNotEmpty({ message: 'Hash type is required' })
  type: string;

  @ApiProperty({
    description: 'Template string for generating hash',
    example:
      '$p_cust_id_cliente^$p_key^$x_ref_payco^$x_transaction_id^$x_amount^$x_currency_code',
  })
  @IsString({ message: 'Template string must be a valid string' })
  @IsNotEmpty({ message: 'Template string is required' })
  stringTemplate: string;
}

export class SignatureDto {
  @ApiProperty({
    description: 'Key in the response that holds the signature',
    example: 'x_signature',
  })
  @IsString({ message: 'Key must be a valid string' })
  @IsNotEmpty({ message: 'Key is required' })
  key: string;

  @ApiProperty({
    description: 'Where the signature is found in the response',
    enum: ['body', 'header'],
  })
  @IsIn(['body', 'header'], {
    message: 'PresentIn must be either "body" or "header"',
  })
  @IsNotEmpty({ message: 'PresentIn is required' })
  presentIn: string;
}

export class ConfigPaymentProviderDto {
  @ApiProperty({
    description: 'Credentials required for the payment provider',
    example: {
      p_cust_id_cliente: '12345',
      p_key: 'abcdef123456',
    },
  })
  @IsObject({ message: 'Credentials must be a valid object' })
  @IsNotEmpty({ message: 'Credentials are required' })
  credentials: Record<string, string>;

  @ApiProperty({
    description: 'Mapping configuration for provider and model fields',
    type: PropertyMappingDto,
  })
  @ValidateNested()
  @Type(() => PropertyMappingDto)
  @IsDefined({ message: 'PropertyMapping is required' })
  propertyMapping: PropertyMappingDto;

  @ApiProperty({
    description: 'Hash configuration for signature validation',
    type: HashConfigDto,
  })
  @ValidateNested()
  @Type(() => HashConfigDto)
  @IsDefined({ message: 'HashConfig is required' })
  hashConfig: HashConfigDto;

  @ApiProperty({
    description: 'Signature configuration for validation',
    type: SignatureDto,
  })
  @ValidateNested()
  @Type(() => SignatureDto)
  @IsDefined({ message: 'Signature is required' })
  signature: SignatureDto;

  @ApiProperty({
    description: 'Mapping of provider statuses to internal statuses',
    type: StatusMappingDto,
  })
  @ValidateNested()
  @Type(() => StatusMappingDto)
  @IsDefined({ message: 'StatusMapping is required' })
  statusMapping: StatusMappingDto;
}
