const fs = require('fs');

const recipes = JSON.parse(fs.readFileSync('parsed_menu.json', 'utf8'));

// Extract unique categories
const categoriesSet = new Set(recipes.map(r => r.category));
const categories = Array.from(categoriesSet).map(c => ({
  name: c,
  slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  description: `Delicious ${c} options from Foody Bhai.`
}));

const serviceTemplate = `import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface Recipe {
  id: number;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  category: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  image: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  isVeg: boolean;
  price?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipes: Recipe[] = ${JSON.stringify(recipes, null, 4)};

  getCategories(): {name: string, slug: string, description: string}[] {
    return ${JSON.stringify(categories, null, 4)};
  }

  getRecipes() {
    return of(this.recipes);
  }

  getRecipeBySlug(slug: string) {
    return of(this.recipes.find(r => r.slug === slug));
  }
  
  getRecipesByCategory(category: string) {
    return of(this.recipes.filter(r => r.category.toLowerCase() === category.toLowerCase()));
  }
}
`;

fs.writeFileSync('src/app/services/recipe.service.ts', serviceTemplate);
