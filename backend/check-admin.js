const mongoose = require('mongoose');

async function check() {
  const uri = 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';
  await mongoose.connect(uri);
  
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');
  
  const user = await User.findOne({ email: 'tusharmanusharma@gmail.com' });
  console.log(user);
  process.exit(0);
}

check().catch(console.error);
