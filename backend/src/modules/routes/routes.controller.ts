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

@Controller('routes')
@UseGuards(JwtAuthGuard)
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.routesService.update(id, data);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RouteStatus,
  ) {
    return this.routesService.updateStatus(id, status);
  }

  @Patch(':routeId/stops/:stopId/status')
  updateStopStatus(
    @Param('routeId') routeId: string,
    @Param('stopId') stopId: string,
    @Body('status') status: RouteStopStatus,
  ) {
    return this.routesService.updateStopStatus(routeId, stopId, status);
  }

  @Delete(':id')
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
}
