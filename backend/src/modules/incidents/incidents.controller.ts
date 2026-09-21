import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto.js';
import { AddIncidentCommentDto } from './dto/add-comment.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { IncidentSeverity, IncidentStatus, IncidentType } from '@prisma/client';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  findAll(
    @Query('status') status?: IncidentStatus,
    @Query('severity') severity?: IncidentSeverity,
    @Query('type') type?: IncidentType,
    @Query('search') search?: string,
  ) {
    return this.incidentsService.findAll({ status, severity, type, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'WAREHOUSE_STAFF')
  create(@Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.incidentsService.updateStatus(id, dto);
  }

  @Post(':id/comments')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'WAREHOUSE_STAFF')
  addComment(
    @Param('id') id: string,
    @Body() dto: AddIncidentCommentDto,
  ) {
    return this.incidentsService.addComment(id, dto);
  }
}
