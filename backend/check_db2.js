const mongoose = require('mongoose');
const uri = "mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const agents = await db.collection("agents").find({}).toArray();
  console.log("Agents:", JSON.stringify(agents, null, 2));
  process.exit(0);
}
run();
