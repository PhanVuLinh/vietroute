import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway.js';
import { TelemetrySimulatorService } from './telemetry-simulator.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly simulator: TelemetrySimulatorService,
  ) {}

  @Get('status')
  getStatus() {
    return this.simulator.getStatus();
  }

  @Post('simulation/toggle')
  @UseGuards(JwtAuthGuard)
  toggleSimulation() {
    const isRunning = this.simulator.toggleSimulation();
    return {
      message: isRunning ? 'Đã bật mô phỏng GPS xe di chuyển' : 'Đã tạm dừng mô phỏng GPS',
      isRunning,
    };
  }

  @Post('broadcast/alert')
  @UseGuards(JwtAuthGuard)
  broadcastAlert(
    @Body()
    body: {
      title: string;
      message: string;
      severity?: 'HIGH' | 'MEDIUM' | 'LOW';
    },
  ) {
    this.gateway.broadcastAlert({
      id: `alert-${Date.now()}`,
      title: body.title || 'Cảnh báo vận hành khẩn cấp',
      message: body.message || 'Phát hiện sự cố bất thường từ hệ thống giám sát.',
      severity: body.severity || 'HIGH',
    });

    return { success: true, message: 'Đã phát cảnh báo khẩn cấp tới toàn bộ client' };
  }
}
