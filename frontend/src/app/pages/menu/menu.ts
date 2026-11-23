import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuCard } from '../../components/menu-card/menu-card';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { CmsService } from '../../services/cms.service';
import { CmsSection } from '../../models/cms.model';
import { DynamicSectionRendererComponent } from '../../components/cms/dynamic-section-renderer/dynamic-section-renderer.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MenuCard, DynamicSectionRendererComponent],
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
  cmsHeroSection: CmsSection | null = null;

  private recipeService = inject(RecipeService);
  private cmsService = inject(CmsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.cmsService.getPageBySlug('menu').subscribe(page => {
      if (page && page.sections && page.sections.length > 0) {
        this.cmsHeroSection = page.sections.find(s => (s.type || '').toLowerCase() === 'hero') || null;
      } else {
        this.cmsHeroSection = null;
      }
      this.cdr.detectChanges();
    });

    // Load categories from API
    this.recipeService.getCategories().subscribe(cats => {
      this.categories = [{name: 'All', slug: 'all'}, {name: 'Tiffin Service 🍱', slug: 'tiffin'}, ...cats];
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
    if (categoryName.toLowerCase().includes('tiffin')) {
      this.router.navigate(['/tiffin']);
      return;
    }
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
