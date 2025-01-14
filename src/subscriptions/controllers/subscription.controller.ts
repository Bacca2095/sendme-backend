import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { SubscriptionDto } from '../dto/subscription.dto';
import { SubscriptionService } from '../providers/subscription.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly entityService: SubscriptionService) {}

  @Get()
  @ApiOkResponse({ type: SubscriptionDto, isArray: true })
  async get() {
    return this.entityService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: SubscriptionDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.entityService.getById(id);
  }

  @Post()
  @ApiOkResponse({ type: SubscriptionDto })
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.entityService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SubscriptionDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.entityService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: SubscriptionDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.entityService.delete(id);
  }
}
