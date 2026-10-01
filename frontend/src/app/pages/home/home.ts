import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { MenuCard } from '../../components/menu-card/menu-card';
import { RecipeService, Recipe } from '../../services/recipe.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Hero, RouterLink, MenuCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  popularItems: Recipe[] = [];
  categories: {name: string, slug: string, description: string, icon?: string}[] = [];
  isLoading = true;

  private recipeService = inject(RecipeService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.recipeService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.recipeService.getRecipes().subscribe({
      next: items => {
        this.popularItems = items.slice(0, 4);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
}
