const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0');

async function run() {
  const db = mongoose.connection;
  const collection = db.collection('orders');
  const result = await collection.updateMany(
    {},
    { $set: { "cancelRequest": { requested: true, reason: 'Test', status: 'pending' } } }
  );
  console.log("Updated:", result.modifiedCount);
  process.exit(0);
}
run();
