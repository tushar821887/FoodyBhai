const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.controller.ts');
let content = fs.readFileSync(controllerPath, 'utf8');

const newMethod = `  @UseGuards(JwtAuthGuard)
  @Get('admin/all')`;

const rateMethod = `  @UseGuards(JwtAuthGuard)
  @Post(':id/rate')
  async rateOrder(@Param('id') id: string, @Body('rating') rating: number, @Body('review') review: string) {
    return this.ordersService.rateOrder(id, rating, review);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')`;

content = content.replace(newMethod, rateMethod);
fs.writeFileSync(controllerPath, content);
console.log('Fixed orders.controller.ts');
