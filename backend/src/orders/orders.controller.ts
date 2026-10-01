import { Controller, Get, Post, Body, UseGuards, Req, Put, Param } from '@nestjs/common';
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

  // --- Admin Endpoints ---

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
}
