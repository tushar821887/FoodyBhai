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
  isLoading = true;

  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') || '';
      this.isLoading = true;

      // Load categories from API to resolve slug → name
      this.recipeService.getCategories().subscribe(categories => {
        const category = categories.find(c => c.slug === this.categorySlug);

        if (category) {
          this.categoryName = category.name;
          this.categoryDesc = category.description;
          this.setSeoTags();

          // Load recipes for this category
          this.recipeService.getRecipesByCategory(this.categoryName).subscribe(recipes => {
            this.recipes = recipes;
            this.isLoading = false;
          });
        } else {
          // Slug not found — try matching by the slug pattern from category name
          this.recipeService.getRecipes().subscribe(all => {
            const slugLower = this.categorySlug.replace(/-/g, ' ');
            const matched = all.filter(r =>
              r.category.toLowerCase().replace(/[&]/g, 'and').replace(/\s+/g, '-') === this.categorySlug ||
              r.category.toLowerCase().includes(slugLower)
            );
            if (matched.length > 0) {
              this.categoryName = matched[0].category;
              this.categoryDesc = `${this.categoryName} items from Foody Bhai.`;
              this.recipes = matched;
            }
            this.isLoading = false;
          });
        }
      });
    });
  }

  private setSeoTags() {
    this.title.setTitle(`${this.categoryName} | Foody Bhai`);
    this.meta.updateTag({ name: 'description', content: `Order delicious ${this.categoryName} from Foody Bhai, Meerut. ${this.categoryDesc}` });
  }
}
