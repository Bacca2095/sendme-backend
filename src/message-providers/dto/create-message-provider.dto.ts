import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { MessageProviderConfigDto } from './config-message-provider.dto';
import { MessageProviderDto } from './message-provider.dto';

export class CreateMessageProviderDto extends OmitType(MessageProviderDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'config',
]) {
  @ApiProperty({ description: 'Name of the provider' })
  name: string;
  @ApiProperty({
    description:
      'Configuration for the provider, including credentials and endpoints',
    type: MessageProviderConfigDto,
  })
  config: MessageProviderConfigDto;
}
