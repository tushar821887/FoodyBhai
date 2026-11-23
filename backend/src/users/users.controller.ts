import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Put, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async createUser(@Body() createData: any) {
    return this.usersService.createUser(
      createData.name,
      createData.email,
      createData.password,
      createData.phone,
      createData.role
    );
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    const userId = req.user.id || req.user._id || req.user.sub;
    return this.usersService.findById(userId);
  }

  @Put('me/set-password')
  async setPassword(@Request() req: any, @Body('password') password: string) {
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }
    const userId = req.user.id || req.user._id || req.user.sub;
    return this.usersService.setPassword(userId, password);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('addresses')
  async addAddress(@Request() req: any, @Body() addressData: any) {
    const userId = req.user.id || req.user._id || req.user.sub;
    return this.usersService.addAddress(userId, addressData);
  }

  @Delete('addresses/:addressId')
  async deleteAddress(@Request() req: any, @Param('addressId') addressId: string) {
    const userId = req.user.id || req.user._id || req.user.sub;
    return this.usersService.deleteAddress(userId, addressId);
  }
}
