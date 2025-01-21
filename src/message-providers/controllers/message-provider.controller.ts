import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';

import { CreateMessageProviderDto } from '../dto/create-message-provider.dto';
import { UpdateMessageProviderDto } from '../dto/update-message-provider.dto';
import { MessageProviderService } from '../providers/message-provider.service';

@Controller('message-providers')
export class MessageProviderController {
  constructor(
    private readonly messageProviderService: MessageProviderService,
  ) {}

  @Get()
  async get() {
    return this.messageProviderService.get();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.messageProviderService.getById(id);
  }

  @Post()
  async create(@Body() body: CreateMessageProviderDto) {
    return this.messageProviderService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMessageProviderDto,
  ) {
    return this.messageProviderService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.messageProviderService.delete(id);
  }
}
