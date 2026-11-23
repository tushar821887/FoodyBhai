const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const existing = await mongoose.connection.collection('recipes').find({
    $or: [
      { title: /macaroni|macroni/i },
      { category: /navratri/i },
      { slug: /macaroni|macroni|navratri/i }
    ]
  }).toArray();
  console.log('Existing matching dishes in DB:', existing.map(e => ({ id: e.id, title: e.title, category: e.category, price: e.price })));

  const maxItem = await mongoose.connection.collection('recipes').find({}).sort({ id: -1 }).limit(1).toArray();
  console.log('Max ID item:', maxItem[0]?.id);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
