const mongoose = require('mongoose');
const uri = "mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // create a dummy agent with email directly in DB
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Abhi1234', salt);
  
  await db.collection("agents").insertOne({
    name: 'Abhi',
    phone: '9999999999',
    email: 'abhi@gmail.com',
    passwordHash: hash,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log("Agent abhi inserted directly into DB!");
  process.exit(0);
}
run();
