import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MessageProviderConfigDto } from './config-message-provider.dto';

export class MessageProviderDto implements Provider {
  @ApiProperty({ description: 'Unique identifier of the provider' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Name of the provider' })
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'Configuration for the provider, including credentials and endpoints',
    type: MessageProviderConfigDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MessageProviderConfigDto)
  config: JsonValue;

  @ApiProperty({ description: 'Date when the provider was created' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the provider was last updated' })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the provider was deleted, if applicable',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
