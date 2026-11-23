import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TiffinPlan, TiffinPlanSchema } from './schemas/tiffin-plan.schema';
import { TiffinOrder, TiffinOrderSchema } from './schemas/tiffin-order.schema';
import { TiffinConfig, TiffinConfigSchema } from './schemas/tiffin-config.schema';
import { TiffinService } from './tiffin.service';
import { TiffinController } from './tiffin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TiffinPlan.name, schema: TiffinPlanSchema },
      { name: TiffinOrder.name, schema: TiffinOrderSchema },
      { name: TiffinConfig.name, schema: TiffinConfigSchema },
    ]),
  ],
  controllers: [TiffinController],
  providers: [TiffinService],
  exports: [TiffinService],
})
export class TiffinModule {}
