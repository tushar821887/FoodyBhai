import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { MenuCard } from '../../components/menu-card/menu-card';
import { RecipeService, Recipe } from '../../services/recipe.service';

@Component({
  selector: 'app-home',
  imports: [Hero, RouterLink, MenuCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  popularItems: Recipe[] = [];
  categories: {name: string, slug: string, description: string}[] = [];
  private recipeService = inject(RecipeService);

  ngOnInit() {
    this.categories = this.recipeService.getCategories();
    this.recipeService.getRecipes().subscribe(items => {
      // Get a few popular items for home page
      this.popularItems = items.slice(0, 4);
    });
  }
}
