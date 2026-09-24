import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { TelemetrySimulatorService } from './telemetry-simulator.service.js';
import { RealtimeController } from './realtime.controller.js';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'vietroute-secret-key-enterprise-2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [RealtimeController],
  providers: [RealtimeGateway, TelemetrySimulatorService],
  exports: [RealtimeGateway, TelemetrySimulatorService],
})
export class RealtimeModule {}
