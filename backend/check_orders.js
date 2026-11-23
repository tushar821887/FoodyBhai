const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0');
const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema, 'orders');

async function run() {
  const orders = await Order.find({ "cancelRequest.status": "pending" });
  console.log(orders.map(o => ({ id: o._id, cancelRequest: o.cancelRequest })));
  process.exit(0);
}
run();
