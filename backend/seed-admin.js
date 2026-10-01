const mongoose = require('mongoose');

async function seed() {
  const uri = 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';
  await mongoose.connect(uri);
  
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');
  
  await User.updateOne(
    { email: 'tusharmanusharma@gmail.com' },
    { 
      $set: { 
        name: 'Tushar Sharma',
        passwordHash: 'Test@1234',
        role: 'admin'
      } 
    },
    { upsert: true }
  );
  
  console.log('Admin user updated!');
  process.exit(0);
}

seed().catch(console.error);
