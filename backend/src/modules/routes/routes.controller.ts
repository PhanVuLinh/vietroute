import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';
import { RouteStatus, RouteStopStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('search') search?: string,
  ) {
    return this.routesService.findAll({ status, driverId, search });
  }

  @Get('templates')
  getTemplates() {
    return this.routesService.getTemplates();
  }

  @Post('templates')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  createTemplate(@Body() data: any) {
    return this.routesService.createTemplate(data);
  }

  @Delete('templates/:id')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  deleteTemplate(@Param('id') id: string) {
    return this.routesService.deleteTemplate(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.routesService.update(id, data);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RouteStatus,
  ) {
    return this.routesService.updateStatus(id, status);
  }

  @Patch(':routeId/stops/:stopId/status')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER')
  updateStopStatus(
    @Param('routeId') routeId: string,
    @Param('stopId') stopId: string,
    @Body('status') status: RouteStopStatus,
  ) {
    return this.routesService.updateStopStatus(routeId, stopId, status);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }

  @Post('optimize')
  optimizeStops(
    @Body('originCoords') originCoords: [number, number],
    @Body('stops') stops: any[],
  ) {
    return this.routesService.optimizeStops(originCoords, stops);
  }

  @Post(':id/ai-optimize')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  aiOptimizeRoute(@Param('id') id: string) {
    return this.routesService.aiOptimizeRoute(id);
  }
}

