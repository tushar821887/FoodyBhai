const fs = require('fs');
const file = 'backend/src/orders/orders.controller.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('OptionalJwtAuthGuard')) {
  code = code.replace(
    "import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';",
    "import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';\nimport { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';"
  );
  
  code = code.replace(
    `  @UseGuards(JwtAuthGuard)\n  @Post()\n  async createOrder(@Req() req: any, @Body() orderData: any) {`,
    `  @UseGuards(OptionalJwtAuthGuard)\n  @Post()\n  async createOrder(@Req() req: any, @Body() orderData: any) {`
  );
  
  code = code.replace(
    `    const userId = req.user._id || req.user.id;\n    return this.ordersService.createOrder(userId, orderData);`,
    `    const userId = req.user ? (req.user._id || req.user.id) : undefined;\n    return this.ordersService.createOrder(userId, orderData);`
  );
  
  fs.writeFileSync(file, code);
  console.log("Patched orders controller");
}
