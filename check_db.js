const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("foodyBhaiOrganization");
    const agents = await db.collection("agents").find({}).toArray();
    console.log("Agents:", JSON.stringify(agents, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
