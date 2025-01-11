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

import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationDto } from '../dto/organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationService } from '../providers/organization.service';

@ApiTags('Organizations')
@Controller('organizations')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOkResponse({ type: [OrganizationDto] })
  async get() {
    return this.organizationService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: OrganizationDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.getById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: OrganizationDto })
  async create(@Body() data: CreateOrganizationDto) {
    return this.organizationService.create(data);
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrganizationDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, data);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OrganizationDto })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.remove(id);
  }
}
