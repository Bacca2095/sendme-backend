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

import { CreatePlanDto } from '../dto/create-plan.dto';
import { PlanDto } from '../dto/plan.dto';
import { PlanService } from '../providers/plan.service';

@ApiTags('Plans')
@Controller('plans')
export class PlanController {
  constructor(private readonly entityService: PlanService) {}

  @Get()
  @ApiOkResponse({ type: PlanDto, isArray: true })
  async get() {
    return this.entityService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: PlanDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.entityService.getById(id);
  }

  @Post()
  @ApiOkResponse({ type: PlanDto })
  async create(@Body() dto: CreatePlanDto) {
    return this.entityService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PlanDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePlanDto,
  ) {
    return this.entityService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PlanDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.entityService.delete(id);
  }
}
