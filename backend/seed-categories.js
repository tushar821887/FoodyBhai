const mongoose = require('mongoose');

async function seed() {
  const uri = 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';
  await mongoose.connect(uri);
  
  // Create schemas for this script
  const Recipe = mongoose.model('Recipe', new mongoose.Schema({ category: String }, { strict: false }));
  const Category = mongoose.model('Category', new mongoose.Schema({ name: { type: String, unique: true }, description: String }));
  
  // Get all recipes
  const recipes = await Recipe.find({});
  
  // Extract unique categories
  const categoryNames = [...new Set(recipes.map(r => r.category).filter(c => c))];
  
  console.log('Found categories in recipes:', categoryNames);
  
  // Insert each category if it doesn't exist
  let added = 0;
  for (const name of categoryNames) {
    try {
      const existing = await Category.findOne({ name });
      if (!existing) {
        await Category.create({ name, description: `All ${name} items` });
        added++;
      }
    } catch (e) {
      console.log('Error creating category:', name, e.message);
    }
  }
  
  console.log(`Successfully added ${added} new categories.`);
  process.exit(0);
}

seed().catch(console.error);
