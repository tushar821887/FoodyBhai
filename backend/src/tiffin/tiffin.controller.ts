import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TiffinService } from './tiffin.service';
import { CreateTiffinOrderDto } from './dto/create-tiffin-order.dto';
import { CreateTiffinPlanDto } from './dto/create-tiffin-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('tiffin')
export class TiffinController {
  constructor(private readonly tiffinService: TiffinService) {}

  // --- PUBLIC CONFIG ENDPOINTS ---

  @Get('config')
  async getConfig() {
    return this.tiffinService.getTiffinConfig();
  }

  @Put('config')
  async updateConfig(@Body() dto: any) {
    return this.tiffinService.updateTiffinConfig(dto);
  }

  @Post('config/seed')
  async seedConfig() {
    return this.tiffinService.seedDefaultConfig();
  }

  // --- PUBLIC PLAN ENDPOINTS ---

  @Get('plans')
  async getPlans(@Query('all') all?: string) {
    const includeInactive = all === 'true' || all === '1';
    return this.tiffinService.findAllPlans(includeInactive);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch('plans/:id/toggle')
  async togglePlan(@Param('id') id: string) {
    return this.tiffinService.togglePlanStatus(id);
  }

  @Get('plans/:slug')
  async getPlan(@Param('slug') slug: string) {
    return this.tiffinService.findPlanBySlug(slug);
  }

  // --- SEED PLANS ---

  @Post('plans/seed')
  async seedPlans() {
    return this.tiffinService.seedDefaultPlans();
  }

  // --- ADMIN PLAN MANAGEMENT ---

  @UseGuards(OptionalJwtAuthGuard)
  @Post('plans')
  async createPlan(@Body() dto: CreateTiffinPlanDto) {
    return this.tiffinService.createPlan(dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: Partial<CreateTiffinPlanDto>) {
    return this.tiffinService.updatePlan(id, dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.tiffinService.deletePlan(id);
  }

  // --- SUBSCRIPTIONS / ORDERS ---

  @Post('subscribe')
  async createSubscription(@Body() dto: CreateTiffinOrderDto, @Request() req: any) {
    const userId = req?.user?.userId || req?.user?._id;
    return this.tiffinService.createOrder(dto, userId);
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateTiffinOrderDto, @Request() req: any) {
    const userId = req?.user?.userId || req?.user?._id;
    return this.tiffinService.createOrder(dto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(
    @Query('phone') phone?: string,
    @Query('email') email?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.userId || req?.user?._id;
    const userEmail = email || req?.user?.email;
    return this.tiffinService.findUserOrders(phone, userId, userEmail);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('orders')
  async getAllOrders() {
    return this.tiffinService.findAllOrders();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'paused' | 'completed' | 'cancelled',
  ) {
    return this.tiffinService.updateOrderStatus(id, status);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch('orders/:id')
  async updateOrderDetails(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.tiffinService.updateOrderDetails(id, dto);
  }
}
