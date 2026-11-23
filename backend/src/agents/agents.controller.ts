import { Controller, Get, Post, Body, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body('name') name: string, @Body('phone') phone: string, @Body('email') email?: string, @Body('password') password?: string) {
    return this.agentsService.create(name, phone, email, password);
  }

  @Get()
  findAll() {
    return this.agentsService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.agentsService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.agentsService.delete(id);
  }
}
