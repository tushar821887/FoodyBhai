import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Recipe {
  _id?: string;
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

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly API_URL = environment.apiUrl;

  // Cache so we don't refetch on every component
  private recipesCache: Recipe[] | null = null;
  private categoriesCache: Category[] | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ─── Recipes ─────────────────────────────────────────────────────────────

  getRecipes(): Observable<Recipe[]> {
    if (this.recipesCache) {
      return of(this.recipesCache);
    }
    return this.http.get<Recipe[]>(`${this.API_URL}/recipes`).pipe(
      tap(recipes => { this.recipesCache = recipes; }),
      catchError(err => {
        console.error('Failed to load recipes from API', err);
        return of([]);
      })
    );
  }

  /** Force a fresh fetch (called after admin edits) */
  refreshRecipes(): Observable<Recipe[]> {
    this.recipesCache = null;
    return this.getRecipes();
  }

  getRecipeBySlug(slug: string): Observable<Recipe | undefined> {
    return this.getRecipes().pipe(
      map(recipes => recipes.find(r => r.slug === slug))
    );
  }

  getRecipesByCategory(category: string): Observable<Recipe[]> {
    return this.getRecipes().pipe(
      map(recipes => recipes.filter(r =>
        r.category.toLowerCase() === category.toLowerCase() ||
        r.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
      ))
    );
  }

  // ─── Categories ──────────────────────────────────────────────────────────

  getCategoriesFromApi(): Observable<Category[]> {
    if (this.categoriesCache) {
      return of(this.categoriesCache);
    }
    return this.http.get<Category[]>(`${this.API_URL}/categories`).pipe(
      tap(cats => { this.categoriesCache = cats; }),
      catchError(err => {
        console.error('Failed to load categories from API', err);
        return of([]);
      })
    );
  }

  /**
   * Returns categories with icon + slug for homepage/menu,
   * merging API categories with icon definitions.
   */
  getCategories(): Observable<{name: string, slug: string, description: string, icon: string, image?: string}[]> {
    const iconMap: Record<string, string> = {
      'popcorn': '🍿',
      'main course': 'fa-solid fa-bowl-food',
      'puri & sabzi': 'fa-solid fa-plate-wheat',
      'puri and sabzi': 'fa-solid fa-plate-wheat',
      'rice': 'fa-solid fa-bowl-rice',
      'everyday essentials': 'fa-solid fa-basket-shopping',
      'snacks': 'fa-solid fa-cookie-bite',
      'fresh salad': 'fa-solid fa-leaf',
      'raita and sides': 'fa-solid fa-spoon',
      'raita & sides': 'fa-solid fa-spoon',
      'drinks & beverages': 'fa-solid fa-glass-water',
      'drinks and beverages': 'fa-solid fa-glass-water',
      'drinks': 'fa-solid fa-glass-water',
      'special combos': 'fa-solid fa-fire-flame-curved',
      'thalis and mini meals': 'fa-solid fa-utensils',
      'thalis & mini meals': 'fa-solid fa-utensils',
      'beverages': 'fa-solid fa-glass-water',
      'thali meals': 'fa-solid fa-utensils',
      'burger': 'fa-solid fa-burger',
      'burgers': 'fa-solid fa-burger',
      'pizza': 'fa-solid fa-pizza-slice',
      'pizzas': 'fa-solid fa-pizza-slice',
      'dessert': 'fa-solid fa-ice-cream',
      'desserts': 'fa-solid fa-ice-cream',
      'ice cream': 'fa-solid fa-ice-cream',
      'cake': 'fa-solid fa-cake-candles',
      'tea': 'fa-solid fa-mug-hot',
      'coffee': 'fa-solid fa-mug-saucer',
      'chinese': 'fa-solid fa-bowl-rice',
      'noodles': 'fa-solid fa-bowl-rice',
      'pasta': 'fa-solid fa-bowl-food',
      'bread': 'fa-solid fa-bread-slice',
      'breads': 'fa-solid fa-bread-slice',
      'soup': 'fa-solid fa-mug-hot',
      'soups': 'fa-solid fa-mug-hot',
    };

    const getCompatibleIcon = (name: string): string => {
      const lower = name.toLowerCase().trim();
      if (iconMap[lower]) return iconMap[lower];
      if (lower.includes('popcorn') || lower.includes('corn')) return '🍿';
      if (lower.includes('drink') || lower.includes('beverage') || lower.includes('shake') || lower.includes('juice')) return 'fa-solid fa-glass-water';
      if (lower.includes('chai') || lower.includes('tea') || lower.includes('coffee')) return 'fa-solid fa-mug-hot';
      if (lower.includes('puri') || lower.includes('roti') || lower.includes('naan') || lower.includes('paratha')) return 'fa-solid fa-plate-wheat';
      if (lower.includes('thali') || lower.includes('meal')) return 'fa-solid fa-utensils';
      if (lower.includes('rice') || lower.includes('biryani') || lower.includes('pulao')) return 'fa-solid fa-bowl-rice';
      if (lower.includes('snack') || lower.includes('biscuit') || lower.includes('cookie') || lower.includes('munch')) return 'fa-solid fa-cookie-bite';
      if (lower.includes('salad')) return 'fa-solid fa-leaf';
      if (lower.includes('sweet') || lower.includes('dessert') || lower.includes('ice cream')) return 'fa-solid fa-ice-cream';
      if (lower.includes('cake') || lower.includes('pastry')) return 'fa-solid fa-cake-candles';
      if (lower.includes('combo')) return 'fa-solid fa-fire-flame-curved';
      if (lower.includes('burger')) return 'fa-solid fa-burger';
      if (lower.includes('pizza')) return 'fa-solid fa-pizza-slice';
      if (lower.includes('essential') || lower.includes('grocery')) return 'fa-solid fa-basket-shopping';
      if (lower.includes('raita') || lower.includes('side')) return 'fa-solid fa-spoon';
      return 'fa-solid fa-bowl-food';
    };

    return this.getCategoriesFromApi().pipe(
      map(cats => cats.map(cat => ({
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[&]/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: cat.description || `${cat.name} from Foody Bhai.`,
        icon: (cat.icon && cat.icon.trim()) ? cat.icon.trim() : getCompatibleIcon(cat.name),
        image: cat.image && cat.image.trim() ? cat.image.trim() : undefined
      })))
    );
  }
}
