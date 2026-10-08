const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0');
const agentSchema = new mongoose.Schema({}, { strict: false });
const Agent = mongoose.model('Agent', agentSchema, 'agents');

async function run() {
  const agents = await Agent.find({});
  console.log(agents.map(a => a.email));
  process.exit(0);
}
run();
