import { Component, OnInit, inject, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MenuCard } from '../../components/menu-card/menu-card';
import { RecipeService, Recipe } from '../../services/recipe.service';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, MenuCard],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
  allItems: Recipe[] = [];
  filteredItems: Recipe[] = [];
  categories: {name: string, slug: string}[] = [];

  activeCategory: string = 'All';
  searchQuery: string = '';
  vegOnly: boolean = false;

  isLoading = true;
  skeletonItems = [1, 2, 3, 4, 5, 6]; // 6 skeleton cards

  private recipeService = inject(RecipeService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Load categories from API
    this.recipeService.getCategories().subscribe(cats => {
      this.categories = [{name: 'All', slug: 'all'}, ...cats];
      this.cdr.detectChanges();
    });

    // Load recipes from API
    this.recipeService.getRecipes().subscribe({
      next: (items) => {
        this.allItems = items;
        this.filteredItems = items;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load recipes', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setCategory(categoryName: string) {
    this.activeCategory = categoryName;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  toggleVegOnly() {
    this.vegOnly = !this.vegOnly;
    this.applyFilters();
  }

  resetFilters() {
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.vegOnly = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredItems = this.allItems.filter(item => {
      const matchCategory = this.activeCategory === 'All' || item.category === this.activeCategory;
      const matchSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchVeg = !this.vegOnly || item.isVeg;
      return matchCategory && matchSearch && matchVeg;
    });
  }
}
