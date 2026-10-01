import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body('name') name: string, @Body('phone') phone: string) {
    return this.agentsService.create(name, phone);
  }

  @Get()
  findAll() {
    return this.agentsService.findAll();
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.agentsService.delete(id);
  }
}
