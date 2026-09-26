import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { QueryAuditDto, CreateAuditLogDto } from './dto/query-audit.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll(@Query() query: QueryAuditDto) {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'MANAGER')
  getStats() {
    return this.auditService.getStats();
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  create(@Body() dto: CreateAuditLogDto) {
    return this.auditService.logEvent(dto);
  }
}
