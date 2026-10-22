const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';

const targetEmail = process.argv[2] || 'tusharmanusharma@gmail.com';
const newPassword = process.argv[3] || 'FoodyAdmin@2026';

async function resetPassword() {
  console.log(`Connecting to MongoDB Atlas...`);
  await mongoose.connect(uri);

  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');

  const user = await User.findOne({ email: targetEmail.toLowerCase().trim() });
  if (!user) {
    console.error(`User with email "${targetEmail}" not found in database!`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await User.updateOne(
    { _id: user._id },
    { 
      $set: { 
        passwordHash: passwordHash,
        role: 'admin',
        needsPasswordSet: false
      } 
    }
  );

  console.log('----------------------------------------------------');
  console.log('✅ Admin password updated successfully!');
  console.log(`📧 Email: ${user.email}`);
  console.log(`🔑 New Password: ${newPassword}`);
  console.log(`👤 Role: admin`);
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

resetPassword().catch(err => {
  console.error('Error resetting password:', err);
  process.exit(1);
});
