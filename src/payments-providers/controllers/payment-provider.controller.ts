import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreatePaymentProviderDto } from '../dto/create-payment-provider.dto';
import { PaymentProviderDto } from '../dto/payment-provider.dto';
import { UpdatePaymentProviderDto } from '../dto/update-payment-provider.dto';
import { PaymentProviderService } from '../providers/payment-provider.service';

@ApiTags('Payment Provider')
@Controller('payment-provider')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
export class PaymentProviderController {
  constructor(
    private readonly paymentProviderService: PaymentProviderService,
  ) {}

  @Get()
  async get(): Promise<PaymentProviderDto[]> {
    return this.paymentProviderService.get();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PaymentProviderDto> {
    return this.paymentProviderService.getById(+id);
  }

  @Post()
  async create(
    @Body() createPaymentProviderDto: CreatePaymentProviderDto,
  ): Promise<PaymentProviderDto> {
    return this.paymentProviderService.create(createPaymentProviderDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentProviderDto: UpdatePaymentProviderDto,
  ): Promise<PaymentProviderDto> {
    return this.paymentProviderService.update(+id, updatePaymentProviderDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<PaymentProviderDto> {
    return this.paymentProviderService.delete(+id);
  }
}
