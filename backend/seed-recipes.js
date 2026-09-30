const mongoose = require('mongoose');
const fs = require('fs');

async function seed() {
  const uri = 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';
  await mongoose.connect(uri);
  
  const recipeSchema = new mongoose.Schema({ id: Number }, { strict: false });
  const Recipe = mongoose.model('Recipe', recipeSchema);
  
  const rawData = fs.readFileSync('parsed_menu.json', 'utf8');
  const recipes = JSON.parse(rawData);
  
  await Recipe.deleteMany({});
  await Recipe.insertMany(recipes);
  console.log('Seeded ' + recipes.length + ' recipes!');
  process.exit(0);
}

seed().catch(console.error);
