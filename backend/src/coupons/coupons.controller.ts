import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // 1. Overall Coupon & Tracking Metrics (Admin)
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.couponsService.getStats();
  }

  // 2. Coupon Tracking: Detailed customer orders per coupon (Admin)
  @UseGuards(JwtAuthGuard)
  @Get('tracking/orders')
  async getCouponOrders(@Query('code') code?: string) {
    return this.couponsService.getCouponOrders(code);
  }

  // 3. Active Public Coupons for Banner / Suggestions (Public)
  @Get('active')
  async getActivePublicCoupons() {
    return this.couponsService.getActivePublicCoupons();
  }

  // 4. Validate Coupon at Cart / Checkout (Public)
  @Post('validate')
  async validateCoupon(
    @Body('code') code: string,
    @Body('orderAmount') orderAmount: number,
    @Body('userId') userId?: string,
  ) {
    return this.couponsService.validateCoupon(code, orderAmount, userId);
  }

  // 5. Get All Coupons with Performance Metrics (Admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.couponsService.findAll();
  }

  // 6. Create Coupon (Admin)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: any) {
    return this.couponsService.create(createDto);
  }

  // 7. Update Coupon (Admin)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.couponsService.update(id, updateDto);
  }

  // 8. Delete Coupon (Admin)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
