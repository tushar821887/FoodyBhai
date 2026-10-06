const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'backend', 'src', 'users', 'users.controller.ts');
let content = fs.readFileSync(controllerPath, 'utf8');

if (!content.includes('@Put')) {
  content = content.replace("import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';",
    "import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Put } from '@nestjs/common';");
}

const newEndpoints = `
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
`;

content = content.replace('async getProfile', newEndpoints + '\n  @Get(\'me\')\n  async getProfile');
// fix duplicate @Get('me') if any issue, replacing properly:
content = content.replace(/\s*@Get\('me'\)\s*@Get\('me'\)/, "\n  @Get('me')");

fs.writeFileSync(controllerPath, content);
console.log('users.controller.ts updated');
