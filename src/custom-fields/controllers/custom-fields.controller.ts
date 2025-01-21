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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PermissionsGuard } from '@/permissions/guards/permission.guard';

import { CreateCustomFieldDto } from '../dto/create-custom-field.dto';
import { CustomFieldDto } from '../dto/custom-field.dto';
import { CustomFieldsService } from '../providers/custom-fields.service';

@ApiTags('Custom Fields')
@Controller('custom-fields')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Get()
  @ApiOkResponse({ type: CustomFieldDto, isArray: true })
  async get() {
    return this.customFieldsService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: CustomFieldDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.customFieldsService.getById(id);
  }

  @Post()
  @ApiOkResponse({ type: CustomFieldDto })
  async create(@Body() dto: CreateCustomFieldDto) {
    return this.customFieldsService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CustomFieldDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCustomFieldDto,
  ) {
    return this.customFieldsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CustomFieldDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.customFieldsService.delete(id);
  }
}
