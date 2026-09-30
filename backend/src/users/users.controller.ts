import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Post('addresses')
  async addAddress(@Request() req: any, @Body() addressData: any) {
    return this.usersService.addAddress(req.user.id, addressData);
  }

  @Delete('addresses/:addressId')
  async deleteAddress(@Request() req: any, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(req.user.id, addressId);
  }
}
