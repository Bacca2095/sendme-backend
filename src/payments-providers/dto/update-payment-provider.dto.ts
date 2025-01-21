import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { ConfigPaymentProviderDto } from './config-payment-provider.dto';
import { CreatePaymentProviderDto } from './create-payment-provider.dto';

export class UpdateConfigPaymentProviderDto extends PartialType(
  ConfigPaymentProviderDto,
) {}

export class UpdatePaymentProviderDto extends PartialType(
  OmitType(CreatePaymentProviderDto, ['config', 'name']),
) {
  @ApiPropertyOptional()
  @Type(() => UpdateConfigPaymentProviderDto)
  @IsOptional()
  config: UpdateConfigPaymentProviderDto;
}
