const fs = require('fs');

const content = fs.readFileSync('src/app/services/recipe.service.ts', 'utf8');

// The file exports RecipeService which has a private recipes array.
// Let's extract the JSON, modify it, and put it back.
const recipesStart = content.indexOf('private recipes: Recipe[] = [') + 'private recipes: Recipe[] = '.length;
const recipesEnd = content.indexOf('];\n', recipesStart) + 1;
const recipesStr = content.substring(recipesStart, recipesEnd);

let recipes = JSON.parse(recipesStr);

const catImages = {
  'Main Course': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  'Puri & Sabzi': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  'Rice': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  'Everyday Essentials': 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=800&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1626779849509-563b7fb3f8b0?auto=format&fit=crop&w=800&q=80', // Assuming some pasta/snack
  'Fresh Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'Raita And Sides': 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80', // Yogurt
  'Drinks & Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', // Drink
  'Special Combos': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=800&q=80',
  'Thalis And Mini Meals': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'
};

// Also apply some specific item rules based on title
const specificImages = {
  'maggi': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80',
  'pasta': 'https://images.unsplash.com/photo-1626779849509-563b7fb3f8b0?auto=format&fit=crop&w=800&q=80',
  'macaroni': 'https://images.unsplash.com/photo-1626779849509-563b7fb3f8b0?auto=format&fit=crop&w=800&q=80'
};

recipes = recipes.map(r => {
  let img = catImages[r.category] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  
  for (let key in specificImages) {
    if (r.title.toLowerCase().includes(key)) {
      img = specificImages[key];
    }
  }
  
  r.image = img;
  return r;
});

const newContent = content.substring(0, recipesStart) + JSON.stringify(recipes, null, 4) + content.substring(recipesEnd);
fs.writeFileSync('src/app/services/recipe.service.ts', newContent);
console.log('Images updated.');
