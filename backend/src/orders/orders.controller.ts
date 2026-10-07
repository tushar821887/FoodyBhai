import { Controller, Req, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Req() req: any, @Body() orderData: any) {
    const userId = req.user._id || req.user.id;
    return this.ordersService.createOrder(userId, orderData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserOrders(@Req() req: any) {
    const userId = req.user._id || req.user.id;
    return this.ordersService.getUserOrders(userId);
  }

  @Get('restaurant/stats')
  async getRestaurantStats() {
    return this.ordersService.getRestaurantStats();
  }

  // --- Admin Endpoints ---

  @UseGuards(JwtAuthGuard)
  @Post(':id/rate')
  async rateOrder(@Param('id') id: string, @Body('rating') rating: number, @Body('review') review: string) {
    return this.ordersService.rateOrder(id, rating, review);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllOrders() {
    // In a real app, check req.user.role === 'admin'
    return this.ordersService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('preparationTime') preparationTime?: number,
    @Body('deliveryAgent') deliveryAgent?: { name: string; phone: string }
  ) {
    return this.ordersService.updateOrderStatus(id, status, preparationTime, deliveryAgent);
  }

  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.ordersService.generateInvoice(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
    });
    stream.pipe(res);
  }

}