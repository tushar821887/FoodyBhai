const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

const newServiceMethod = `  async getRestaurantStats() {
    const ordersWithRatings = await this.orderModel.find({ rating: { $exists: true, $ne: null } }).exec();
    const totalRatings = ordersWithRatings.length;
    const avgRating = totalRatings > 0 
      ? (ordersWithRatings.reduce((sum, order) => sum + (order.rating || 0), 0) / totalRatings).toFixed(1)
      : 0;
      
    return {
      averageRating: parseFloat(avgRating as string),
      totalReviews: totalRatings
    };
  }
}`;

serviceContent = serviceContent.replace(/}\s*$/, newServiceMethod);
fs.writeFileSync(servicePath, serviceContent);

const controllerPath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.controller.ts');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

const newControllerMethod = `  @Get('restaurant/stats')
  async getRestaurantStats() {
    return this.ordersService.getRestaurantStats();
  }

  // --- Admin Endpoints ---`;

controllerContent = controllerContent.replace('  // --- Admin Endpoints ---', newControllerMethod);
fs.writeFileSync(controllerPath, controllerContent);

console.log('Added stats endpoint');
