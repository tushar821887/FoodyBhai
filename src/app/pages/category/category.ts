import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { MenuCard } from '../../components/menu-card/menu-card';

@Component({
  selector: 'app-category',
  imports: [CommonModule, RouterModule, MenuCard],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category implements OnInit {
  categorySlug: string = '';
  categoryName: string = '';
  categoryDesc: string = '';
  recipes: Recipe[] = [];

  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') || '';
      
      const categories = this.recipeService.getCategories();
      const category = categories.find(c => c.slug === this.categorySlug);
      
      if (category) {
        this.categoryName = category.name;
        this.categoryDesc = category.description;
        
        this.setSeoTags();
        
        this.recipeService.getRecipesByCategory(this.categoryName).subscribe(recipes => {
          this.recipes = recipes;
        });
      }
    });
  }

  private setSeoTags() {
    this.title.setTitle(`${this.categoryName} Recipes | FoodyBhai`);
    this.meta.updateTag({ name: 'description', content: `Explore our collection of delicious ${this.categoryName} recipes. ${this.categoryDesc}` });
  }
}
