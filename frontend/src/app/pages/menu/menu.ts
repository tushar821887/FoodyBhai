import { Component, OnInit, inject } from '@angular/core';
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
  
  private recipeService = inject(RecipeService);

  ngOnInit() {
    this.categories = [{name: 'All', slug: 'all'}, ...this.recipeService.getCategories()];
    this.recipeService.getRecipes().subscribe(items => {
      this.allItems = items;
      this.filteredItems = items;
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
      // Category filter
      const matchCategory = this.activeCategory === 'All' || item.category === this.activeCategory;
      
      // Search filter
      const matchSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Veg filter
      const matchVeg = !this.vegOnly || item.isVeg;
      
      return matchCategory && matchSearch && matchVeg;
    });
  }
}
