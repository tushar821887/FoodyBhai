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
  getCategories(): Observable<{name: string, slug: string, description: string, icon: string}[]> {
    const iconMap: Record<string, string> = {
      'main course': 'fa-solid fa-bowl-food',
      'puri & sabzi': 'fa-solid fa-bread-slice',
      'puri and sabzi': 'fa-solid fa-bread-slice',
      'rice': 'fa-solid fa-bowl-rice',
      'everyday essentials': 'fa-solid fa-basket-shopping',
      'snacks': 'fa-solid fa-cookie-bite',
      'fresh salad': 'fa-solid fa-leaf',
      'raita and sides': 'fa-solid fa-spoon',
      'raita & sides': 'fa-solid fa-spoon',
      'drinks & beverages': 'fa-solid fa-mug-hot',
      'drinks and beverages': 'fa-solid fa-mug-hot',
      'drinks': 'fa-solid fa-mug-hot',
      'special combos': 'fa-solid fa-boxes-stacked',
      'thalis and mini meals': 'fa-solid fa-utensils',
      'thalis & mini meals': 'fa-solid fa-utensils',
    };

    return this.getCategoriesFromApi().pipe(
      map(cats => cats.map(cat => ({
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[&]/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: cat.description || `${cat.name} from Foody Bhai.`,
        icon: iconMap[cat.name.toLowerCase()] || 'fa-solid fa-utensils'
      })))
    );
  }
}
