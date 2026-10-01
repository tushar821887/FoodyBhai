const mongoose = require('mongoose');
const fs = require('fs');

// ─── Mongoose Schema (mirrors backend) ──────────────────────────────────────
const RecipeSchema = new mongoose.Schema({ id: Number }, { strict: false });
const Recipe = mongoose.model('Recipe', RecipeSchema);

const CategorySchema = new mongoose.Schema({ name: String, description: String }, { timestamps: true });
const Category = mongoose.model('Category', CategorySchema);

async function seed() {
  const uri = 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ─── 1. Seed Recipes ──────────────────────────────────────────────────────
  const recipes = JSON.parse(fs.readFileSync('/tmp/original_recipes.json', 'utf8'));

  await Recipe.deleteMany({});
  await Recipe.insertMany(recipes);
  console.log(`✅ Seeded ${recipes.length} recipes with correct images`);

  // ─── 2. Seed Categories (unique from recipes) ─────────────────────────────
  const categoryNames = [...new Set(recipes.map(r => r.category))];
  await Category.deleteMany({});
  const categoryDocs = categoryNames.map(name => ({
    name,
    description: `${name} items from Foody Bhai, Meerut.`
  }));
  await Category.insertMany(categoryDocs);
  console.log(`✅ Seeded ${categoryDocs.length} categories:`, categoryNames.join(', '));

  process.exit(0);
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
