import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getAll() {
    return this.recipesService.findAll();
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.recipesService.findBySlug(slug);
  }

  // Admin routes protected by JWT
  // For production, you should add a RolesGuard to verify user.role === 'admin'
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() data: any) {
    // Basic admin check (Assuming admin emails contain 'tushar' or define a better role system)
    if (req.user.email !== 'tushar8218870579@gmail.com' && !req.user.email.includes('admin')) {
      // throw new UnauthorizedException('Admin access required');
    }
    return this.recipesService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.recipesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}
