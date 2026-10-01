import { Component, OnInit, inject } from '@angular/core';
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
  private recipeService = inject(RecipeService);

  ngOnInit() {
    // Load categories from API
    this.recipeService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    // Load recipes from API
    this.recipeService.getRecipes().subscribe(items => {
      this.popularItems = items.slice(0, 4);
    });
  }
}
