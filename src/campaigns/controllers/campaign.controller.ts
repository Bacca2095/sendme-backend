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

import { CampaignDto } from '../dto/campaign.dto';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { CampaignService } from '../providers/campaign.service';

@ApiTags('Campaigns')
@Controller('campaigns')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @ApiOkResponse({ type: CampaignDto, isArray: true })
  async get() {
    return this.campaignService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: CampaignDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.getById(id);
  }

  @Post()
  @ApiOkResponse({ type: CampaignDto })
  async create(@Body() dto: CreateCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CampaignDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CampaignDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.delete(id);
  }
}
