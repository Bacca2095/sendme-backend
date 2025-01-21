import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PermissionsGuard } from '@/permissions/guards/permission.guard';

import { ContactDto } from '../dto/contact.dto';
import { CreateContactDto } from '../dto/create-contact.dto';
import { ContactService } from '../providers/contact.service';

@ApiTags('Contacts')
@Controller('contacts')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOkResponse({ type: ContactDto, isArray: true })
  async get() {
    return this.contactService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: ContactDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.getById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ContactDto })
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ContactDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ContactDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.delete(id);
  }
}
