const fs = require('fs');

const controllerPath = 'backend/src/categories/categories.controller.ts';
let controller = fs.readFileSync(controllerPath, 'utf8');
controller = controller.replace(/import \{ Controller, Get, Post, Delete, Body, Param, UseGuards \} from '@nestjs\/common';/, `import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';`);
controller = controller.replace(/@UseGuards\(JwtAuthGuard\)\n  @Delete\(':id'\)/, `@UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')`);
fs.writeFileSync(controllerPath, controller);

const servicePath = 'backend/src/categories/categories.service.ts';
let service = fs.readFileSync(servicePath, 'utf8');
service = service.replace(/async remove/, `async update(id: string, data: any): Promise<CategoryDocument> {
    return this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove`);
fs.writeFileSync(servicePath, service);

