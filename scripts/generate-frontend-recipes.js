const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, '../parsed_menu.json'), 'utf8'));

const outDir = path.join(__dirname, '../frontend/src/app/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const content = `import { Recipe } from '../services/recipe.service';

export const STATIC_RECIPES: Recipe[] = ${JSON.stringify(recipes, null, 2)};
`;

fs.writeFileSync(path.join(outDir, 'recipes.data.ts'), content, 'utf8');
console.log('Successfully generated frontend/src/app/data/recipes.data.ts with ' + recipes.length + ' recipes!');
