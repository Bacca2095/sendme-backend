import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { MessageProviderDto, ProviderConfigDto } from './message-provider.dto';

export class CreateMessageProviderDto extends OmitType(MessageProviderDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => ProviderConfigDto)
  config: ProviderConfigDto;
}
