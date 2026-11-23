const fs = require('fs');
const path = require('path');

// Add GET /:id/invoice to orders.controller.ts
const controllerPath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.controller.ts');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

const importRes = "import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Res } from '@nestjs/common';\nimport { Response } from 'express';";
controllerContent = controllerContent.replace(/import \{ Controller.*\} from '@nestjs\/common';/, importRes);

const newEndpoint = `
  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.ordersService.generateInvoice(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': \`attachment; filename=invoice-\${id}.pdf\`,
    });
    stream.pipe(res);
  }
`;
// Insert before final closing brace
controllerContent = controllerContent.replace(/\}\s*$/, newEndpoint + '\n}');
fs.writeFileSync(controllerPath, controllerContent);

console.log('Fixed controller');
