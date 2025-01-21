import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class FieldMappingDto {
  @ApiProperty({
    description: 'Field in provider/model',
    example: 'countryCode',
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Type of the field',
    enum: ['string', 'number', 'boolean', 'date'],
  })
  @IsEnum(['string', 'number', 'boolean', 'date'])
  type: string;

  @ApiProperty({ description: 'Default value (if any)', required: false })
  @IsOptional()
  default?: any;
}

class ArrayMappingDto {
  @ApiProperty({
    description: 'Field in provider/model',
    example: 'recipients',
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Mapping details for array items',
    type: () => FieldMappingDto,
  })
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  mapping: Record<string, FieldMappingDto>;
}

class RequestBodyMappingDto {
  @ApiProperty({
    description: 'Request body mappings',
    example: {
      country: { field: 'countryCode', type: 'string', default: '57' },
      recipients: {
        field: 'recipients',
        type: 'array',
        mapping: {
          mobile: { field: 'phone', type: 'string' },
          correlationLabel: { field: 'contactId', type: 'string' },
        },
      },
    },
  })
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  mapping: Record<string, FieldMappingDto | ArrayMappingDto>;
}

class ResponseMappingDto {
  @ApiProperty({
    description: 'Response mapping configuration',
    example: {
      status: { field: 'status', type: 'number' },
      totalFailed: { field: 'result.totalFailed', type: 'number' },
    },
  })
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  mapping: Record<string, FieldMappingDto | ArrayMappingDto>;
}

class EndpointDto {
  @ApiProperty({
    description: 'URL for the endpoint',
    example: 'https://api.example.com/messages/batch',
  })
  @IsString()
  url: string;

  @ApiProperty({ description: 'HTTP method', example: 'POST' })
  @IsString()
  httpMethod: string;

  @ApiProperty({
    description: 'Request body mappings',
    type: () => RequestBodyMappingDto,
  })
  @ValidateNested()
  @Type(() => RequestBodyMappingDto)
  requestBodyMapping: RequestBodyMappingDto;

  @ApiProperty({
    description: 'Response mapping configuration',
    type: () => ResponseMappingDto,
  })
  @ValidateNested()
  @Type(() => ResponseMappingDto)
  responseMapping: ResponseMappingDto;
}

class HeaderItemDto {
  @ApiProperty({ description: 'Header key', example: 'authorization' })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Value template for the header',
    example: 'Basic $base64(username:password)',
  })
  @IsString()
  valueTemplate: string;
}

class HeadersDto {
  @ApiProperty({
    description: 'Authorization header',
    type: () => HeaderItemDto,
  })
  @ValidateNested()
  @Type(() => HeaderItemDto)
  authorization: HeaderItemDto;

  @ApiProperty({
    description: 'Content type header',
    example: 'application/json',
  })
  @IsString()
  contentType: string;
}

export class MessageProviderConfigDto {
  @ApiProperty({
    description: 'Credentials required for the provider',
    example: {
      username: 'your_username',
      password: 'your_password',
    },
  })
  @IsObject()
  credentials: Record<string, string>;

  @ApiProperty({
    description: 'Endpoints for the provider',
    type: () => EndpointDto,
    example: {
      sendBatchMessage: {
        url: 'https://api.example.com/messages/batch',
        httpMethod: 'POST',
        requestBodyMapping: {
          country: { field: 'countryCode', type: 'string', default: '57' },
        },
        responseMapping: {
          status: { field: 'status', type: 'number' },
        },
      },
    },
  })
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => EndpointDto)
  endpoints: Record<string, EndpointDto>;

  @ApiProperty({
    description: 'Headers for the provider',
    type: () => HeadersDto,
  })
  @ValidateNested()
  @Type(() => HeadersDto)
  headers: HeadersDto;
}
