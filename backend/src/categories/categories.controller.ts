
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: any) {
    return this.categoriesService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
