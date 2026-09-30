import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from '../cart/cart.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService
  ) {}

  @Post()
  async createOrder(@Request() req: any, @Body() orderData: any) {
    const order = await this.ordersService.createOrder(req.user.id, orderData);
    // Clear user's cart after successful order
    await this.cartService.updateCart(req.user.id, []);
    return order;
  }

  @Get()
  getUserOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }
}
