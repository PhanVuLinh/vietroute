import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { DriversModule } from './modules/drivers/drivers.module.js';
import { WarehousesModule } from './modules/warehouses/warehouses.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { DeliveriesModule } from './modules/deliveries/deliveries.module.js';
import { DispatchModule } from './modules/dispatch/dispatch.module.js';
import { RoutesModule } from './modules/routes/routes.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { WmsModule } from './modules/wms/wms.module.js';
import { IncidentsModule } from './modules/incidents/incidents.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    DriversModule,
    WarehousesModule,
    OrdersModule,
    DeliveriesModule,
    DispatchModule,
    RoutesModule,
    NotificationsModule,
    AnalyticsModule,
    CustomersModule,
    WmsModule,
    IncidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
