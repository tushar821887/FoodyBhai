import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-recipe-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css'
})
export class RecipeDetail implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  recipe: Recipe | undefined;
  relatedRecipes: Recipe[] = [];
  schemaMarkup: SafeHtml = '';
  isLoading = true;

  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private meta = inject(Meta);
  private title = inject(Title);
  private sanitizer = inject(DomSanitizer);
  private cartService = inject(CartService);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.isLoading = true;
        this.recipe = undefined;
        this.recipeService.getRecipeBySlug(slug).subscribe({
          next: (recipe) => {
            this.recipe = recipe;
            this.isLoading = false;
            if (recipe) {
              this.setSeoTags(recipe);
              this.generateSchema(recipe);
              this.loadRelatedRecipes(recipe);
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.recipe = undefined;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRelatedRecipes(currentRecipe: Recipe) {
    this.recipeService.getRecipes().subscribe(all => {
      if (!all || all.length === 0) return;
      const sameCategory = all.filter(r => r.slug !== currentRecipe.slug && r.category === currentRecipe.category);
      const otherCategories = all.filter(r => r.slug !== currentRecipe.slug && r.category !== currentRecipe.category);
      this.relatedRecipes = [...sameCategory, ...otherCategories].slice(0, 4);
      this.cdr.detectChanges();
    });
  }

  addToCart() {
    if (this.recipe) {
      if (this.recipe.inStock === false) {
        alert('This item is currently out of stock.');
        return;
      }
      this.cartService.addToCart(this.recipe);
    }
  }

  getCategorySlug(categoryName: string): string {
    if (!categoryName) return '';
    return categoryName.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-');
  }

  private setSeoTags(recipe: Recipe) {
    this.title.setTitle(`${recipe.seoTitle} | FoodyBhai`);
    this.meta.updateTag({ name: 'description', content: recipe.seoDescription });
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: recipe.seoTitle });
    this.meta.updateTag({ property: 'og:description', content: recipe.seoDescription });
    this.meta.updateTag({ property: 'og:image', content: recipe.image });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
  }

  private generateSchema(recipe: Recipe) {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.title,
      "image": [
        recipe.image
      ],
      "description": recipe.description,
      "keywords": `${recipe.title}, ${recipe.category}, ${recipe.cuisine}, recipe`,
      "recipeYield": `${recipe.servings} servings`,
      "prepTime": this.formatIsoTime(recipe.prepTime),
      "cookTime": this.formatIsoTime(recipe.cookTime),
      "totalTime": this.formatIsoTime(recipe.totalTime),
      "recipeIngredient": recipe.ingredients,
      "recipeInstructions": recipe.instructions.map(inst => ({
        "@type": "HowToStep",
        "text": inst
      })),
      "recipeCategory": recipe.category,
      "recipeCuisine": recipe.cuisine
    };

    const script = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
    this.schemaMarkup = this.sanitizer.bypassSecurityTrustHtml(script);
  }

  private formatIsoTime(timeStr: string): string {
    const minsMatch = timeStr.match(/(\d+)\s*min/);
    if (minsMatch) {
      return `PT${minsMatch[1]}M`;
    }
    return timeStr;
  }
}
