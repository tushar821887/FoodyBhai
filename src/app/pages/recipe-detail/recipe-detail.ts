import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RecipeService, Recipe } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css'
})
export class RecipeDetail implements OnInit {
  recipe: Recipe | undefined;
  schemaMarkup: SafeHtml = '';

  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private meta = inject(Meta);
  private title = inject(Title);
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.recipeService.getRecipeBySlug(slug).subscribe(recipe => {
          this.recipe = recipe;
          if (recipe) {
            this.setSeoTags(recipe);
            this.generateSchema(recipe);
          }
        });
      }
    });
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
    // Basic parser for "X mins" to "PTXM"
    const minsMatch = timeStr.match(/(\d+)\s*min/);
    if (minsMatch) {
      return `PT${minsMatch[1]}M`;
    }
    return timeStr;
  }
}
