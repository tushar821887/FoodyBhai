import { Injectable } from '@angular/core';
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
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipes: Recipe[] = [
    {
      id: 1,
      slug: 'aloo-paratha',
      title: 'Aloo Paratha',
      description: 'Stuffed paratha with spiced potatoes, a classic North Indian breakfast.',
      introduction: 'Aloo Paratha is a popular Indian flatbread stuffed with a spicy potato mixture. It is comforting, filling, and perfect for breakfast or lunch when served with fresh curd and pickle.',
      category: 'Breakfast',
      cuisine: 'North Indian',
      prepTime: '20 mins',
      cookTime: '15 mins',
      totalTime: '35 mins',
      servings: 4,
      difficulty: 'Medium',
      ingredients: [
        '2 cups Whole wheat flour (atta)',
        'Water for kneading',
        '4 medium Potatoes, boiled and mashed',
        '1 Green chili, finely chopped',
        '1/2 tsp Cumin powder',
        '1/2 tsp Garam masala',
        '1/2 tsp Amchur (dry mango powder)',
        'Salt to taste',
        'Ghee or butter for roasting'
      ],
      instructions: [
        'Knead the whole wheat flour with water to make a soft dough. Cover and let it rest for 15 minutes.',
        'In a bowl, mix the mashed potatoes with green chili, cumin powder, garam masala, amchur, and salt to create the stuffing.',
        'Divide the dough into equal-sized balls. Roll one ball into a small circle.',
        'Place a portion of the potato stuffing in the center. Bring the edges together to seal it.',
        'Dust with dry flour and gently roll it into a paratha (flatbread) without spilling the stuffing.',
        'Heat a tawa (griddle) and roast the paratha on both sides, applying ghee or butter, until golden brown spots appear.',
        'Serve hot with yogurt, pickle, or butter.'
      ],
      tips: [
        'Make sure the potatoes are boiled until just soft, not mushy, to prevent the stuffing from becoming watery.',
        'Let the potato mixture cool completely before stuffing it into the dough.'
      ],
      image: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Hot homemade aloo paratha served on a plate',
      seoTitle: 'Authentic Aloo Paratha Recipe | North Indian Breakfast',
      seoDescription: 'Learn how to make perfect, authentic Aloo Paratha with our step-by-step recipe. Delicious spiced potato stuffed flatbread perfect for breakfast.',
      isVeg: true
    },
    {
      id: 2,
      slug: 'paneer-butter-masala',
      title: 'Paneer Butter Masala',
      description: 'Rich & creamy curry made with paneer, spices, onions, and tomatoes.',
      introduction: 'Paneer Butter Masala is one of the most popular vegetarian curries in Indian cuisine. The paneer cubes are simmered in a mildly spiced, creamy tomato and cashew sauce.',
      category: 'Main Course',
      cuisine: 'North Indian',
      prepTime: '15 mins',
      cookTime: '25 mins',
      totalTime: '40 mins',
      servings: 4,
      difficulty: 'Medium',
      ingredients: [
        '250g Paneer, cut into cubes',
        '3 large Tomatoes, pureed',
        '2 large Onions, finely chopped',
        '10-12 Cashews, soaked and ground to a paste',
        '2 tbsp Butter',
        '1 tbsp Oil',
        '1 tsp Ginger-garlic paste',
        '1/2 tsp Turmeric powder',
        '1 tsp Red chili powder',
        '1 tsp Garam masala',
        '1 tsp Kasuri methi (dried fenugreek leaves)',
        '1/4 cup Cream',
        'Salt to taste'
      ],
      instructions: [
        'Heat butter and oil in a pan. Add finely chopped onions and sauté until golden brown.',
        'Add ginger-garlic paste and cook for a minute until the raw smell disappears.',
        'Pour in the tomato puree, turmeric, and red chili powder. Cook until the oil separates from the masala.',
        'Add the cashew paste and cook for another 2-3 minutes, stirring continuously.',
        'Add water to adjust consistency, then add salt and garam masala. Bring to a gentle simmer.',
        'Add the paneer cubes and crushed kasuri methi. Simmer for 5 minutes.',
        'Stir in the cream, mix gently, and turn off the heat.',
        'Garnish with a little more cream and serve hot with naan or rice.'
      ],
      tips: [
        'Soak paneer cubes in warm water for 15 minutes before cooking to keep them soft.',
        'Use ripe, red tomatoes for the best color and flavor.'
      ],
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Creamy paneer butter masala in a bowl',
      seoTitle: 'Creamy Paneer Butter Masala Recipe | Restaurant Style',
      seoDescription: 'Make restaurant-style Paneer Butter Masala at home. A rich, creamy, and mildly spiced Indian curry featuring soft cottage cheese.',
      isVeg: true
    },
    {
      id: 3,
      slug: 'veg-fried-rice',
      title: 'Veg Fried Rice',
      description: 'Classic wok-tossed rice with fresh vegetables and soy sauce.',
      introduction: 'Veg Fried Rice is a popular Indo-Chinese dish made by stir-frying cooked rice with an assortment of crisp vegetables and flavorful sauces. It is quick to make and pairs wonderfully with Manchurian or paneer chili.',
      category: 'Main Course',
      cuisine: 'Indo-Chinese',
      prepTime: '15 mins',
      cookTime: '10 mins',
      totalTime: '25 mins',
      servings: 3,
      difficulty: 'Easy',
      ingredients: [
        '2 cups Cooked rice (preferably cold/leftover)',
        '2 tbsp Oil',
        '1 tbsp Garlic, finely chopped',
        '1/4 cup Spring onions, chopped',
        '1/4 cup Carrots, finely diced',
        '1/4 cup Beans, finely chopped',
        '1/4 cup Bell peppers, diced',
        '1 tbsp Soy sauce',
        '1 tsp Vinegar',
        '1/2 tsp Black pepper powder',
        'Salt to taste'
      ],
      instructions: [
        'Heat oil in a wok or large pan on high heat. Add chopped garlic and sauté for 30 seconds.',
        'Add the white part of the spring onions, carrots, and beans. Stir-fry for 2-3 minutes on high heat until they are slightly tender but still crunchy.',
        'Add bell peppers and stir-fry for another minute.',
        'Add the cooked rice, soy sauce, vinegar, black pepper, and salt.',
        'Toss everything well so the rice is evenly coated with the sauces and mixed with the vegetables.',
        'Garnish with the green part of the spring onions.',
        'Serve hot with your favorite side dish.'
      ],
      tips: [
        'Using leftover, chilled rice works best as the grains remain separate and don\'t become mushy.',
        'Always cook fried rice on high heat to get that characteristic smoky flavor (wok hei).'
      ],
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Vegetable fried rice with spring onions',
      seoTitle: 'Easy Veg Fried Rice Recipe | Indo-Chinese Style',
      seoDescription: 'Quick and easy vegetable fried rice recipe. Learn how to make the perfect restaurant-style wok-tossed fried rice at home in under 30 minutes.',
      isVeg: true
    }
  ];

  getCategories(): {name: string, slug: string, description: string}[] {
    return [
      { name: 'Breakfast', slug: 'breakfast', description: 'Start your day right with these nutritious and delicious breakfast recipes.' },
      { name: 'Main Course', slug: 'main-course', description: 'Hearty and satisfying main dishes for lunch and dinner.' },
      { name: 'Snacks', slug: 'snacks', description: 'Quick and tasty bites perfect for tea time or satisfying mid-day cravings.' },
      { name: 'Desserts', slug: 'desserts', description: 'Sweet treats to complete your meal on a delightful note.' }
    ];
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
