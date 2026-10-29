import { Controller, Req, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Res, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Sse('live-stream')
  streamLiveOrders(): Observable<MessageEvent> {
    return this.ordersService.getOrderEvents().pipe(
      map(event => ({ data: JSON.stringify(event) } as MessageEvent))
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async createOrder(@Req() req: any, @Body() orderData: any) {
    const userId = req.user ? (req.user._id || req.user.id) : undefined;
    return this.ordersService.createOrder(userId, orderData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserOrders(@Req() req: any) {
    const userId = req.user._id || req.user.id;
    const phone = req.user.phone;
    return this.ordersService.getUserOrders(userId, phone);
  }

  @Get('track/:identifier')
  async trackOrder(@Param('identifier') identifier: string) {
    return this.ordersService.trackOrder(identifier);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  async cancelOrderCustomer(@Param('id') id: string, @Body('reason') reason: string) {
    return this.ordersService.cancelOrderCustomer(id, reason);
  }

  @Get('pending-alert')
  async getPendingAlert() {
    return this.ordersService.getPendingAlert();
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
    return this.ordersService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('preparationTime') preparationTime?: number,
    @Body('deliveryAgent') deliveryAgent?: { name: string; phone: string },
    @Body('cancelReason') cancelReason?: string
  ) {
    return this.ordersService.updateOrderStatus(id, status, preparationTime, deliveryAgent, cancelReason);
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

  @UseGuards(JwtAuthGuard)
  @Put('agent/:id/cancel-request')
  async requestCancel(
    @Param('id') id: string,
    @Body('reason') reason: string
  ) {
    return this.ordersService.requestCancel(id, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/resolve-cancel')
  async resolveCancelRequest(
    @Param('id') id: string,
    @Body('approve') approve: boolean,
    @Body('processRefund') processRefund?: boolean
  ) {
    return this.ordersService.resolveCancelRequest(id, approve, processRefund);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/refund')
  async processRefund(@Param('id') id: string) {
    return this.ordersService.processRefund(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('agent/:id/reassign-request')
  async requestReassign(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('agent') agentBody: any,
    @Req() req: any
  ) {
    const agent = (agentBody && agentBody.phone) ? agentBody : {
      name: req.user?.name || 'Agent',
      phone: req.user?.phone || ''
    };
    return this.ordersService.requestReassign(id, reason, agent);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/resolve-reassign')
  async resolveReassignRequest(
    @Param('id') id: string,
    @Body('approve') approve: boolean,
    @Body('newAgent') newAgent?: { name: string; phone: string }
  ) {
    return this.ordersService.resolveReassignRequest(id, approve, newAgent);
  }
}
