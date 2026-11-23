const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { recipesData } = require('./recipe-definitions');

const uri = 'mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0';

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected!');

  const collection = mongoose.connection.collection('recipes');

  // Load current DB recipes
  const currentDbRecipes = await collection.find({}).toArray();
  console.log(`Found ${currentDbRecipes.length} existing recipes in database.`);

  const imageMap = {};
  for (const r of currentDbRecipes) {
    if (r.image) {
      imageMap[r.slug] = r.image;
      imageMap[r.id] = r.image;
    }
  }

  // Also check parsed_menu.json if it exists
  const parsedMenuPath = path.resolve(__dirname, '../parsed_menu.json');
  let parsedMenu = [];
  if (fs.existsSync(parsedMenuPath)) {
    try {
      parsedMenu = JSON.parse(fs.readFileSync(parsedMenuPath, 'utf8'));
      for (const item of parsedMenu) {
        if (item.image && !imageMap[item.slug]) {
          imageMap[item.slug] = item.image;
          imageMap[item.id] = item.image;
        }
      }
    } catch(e) {}
  }

  let updatedCount = 0;
  const mergedRecipes = [];

  for (const data of recipesData) {
    // Preserve existing image if available
    const existingImg = imageMap[data.slug] || imageMap[data.id];
    if (existingImg) {
      data.image = existingImg;
    } else if (!data.image) {
      data.image = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
    }

    const updateDoc = {
      $set: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        cuisine: data.cuisine,
        price: data.price,
        isVeg: data.isVeg,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        totalTime: data.totalTime,
        servings: data.servings,
        difficulty: data.difficulty,
        description: data.description,
        introduction: data.introduction,
        ingredients: data.ingredients,
        instructions: data.instructions,
        tips: data.tips,
        image: data.image,
        imageAlt: data.imageAlt || data.title,
        seoTitle: data.seoTitle || `${data.title} | Foody Bhai`,
        seoDescription: data.seoDescription || data.description
      }
    };

    const res = await collection.updateOne(
      { $or: [{ slug: data.slug }, { id: data.id }] },
      updateDoc,
      { upsert: true }
    );
    updatedCount++;
    mergedRecipes.push({ ...data });
  }

  console.log(`Successfully updated ${updatedCount} recipes in MongoDB!`);

  // Write updated parsed_menu.json
  fs.writeFileSync(parsedMenuPath, JSON.stringify(mergedRecipes, null, 2));
  console.log(`Updated ${parsedMenuPath} with ${mergedRecipes.length} recipes.`);

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
