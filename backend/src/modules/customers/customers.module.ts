import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller.js';
import { B2BPortalController } from './b2b-portal.controller.js';
import { CustomersService } from './customers.service.js';

@Module({
  controllers: [CustomersController, B2BPortalController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
