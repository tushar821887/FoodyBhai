import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

import { RichEditorComponent } from '../../components/rich-editor/rich-editor.component';
import { ThemeManagerComponent } from '../../components/theme-manager/theme-manager.component';
import { PageBuilderComponent } from '../../components/page-builder/page-builder.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RichEditorComponent, ThemeManagerComponent, PageBuilderComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  activeTab: 'menu' | 'theme' | 'cms' = 'theme';
  recipeForm: FormGroup;
  recipes: any[] = [];
  categories: string[] = ['Main Course', 'Puri & Sabzi', 'Rice', 'Everyday Essentials', 'Snacks', 'Beverages', 'Thali Meals'];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL = `${environment.apiUrl}/recipes`;

  constructor() {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['Main Course', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      isVeg: [true],
      image: [''],
      cuisine: ['Indian'],
      prepTime: ['10 mins'],
      cookTime: ['15 mins'],
      totalTime: ['25 mins'],
      servings: [1],
      ingredients: [''],
      instructions: [''],
      recipeHtml: ['']
    });
  }

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.http.get<any[]>(this.API_URL).subscribe({
      next: (data) => this.recipes = data,
      error: (err) => console.error('Failed to load recipes', err)
    });
  }

  onSubmit() {
    if (this.recipeForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const val = this.recipeForm.value;
    let ingredients = val.ingredients || [];
    if (typeof ingredients === 'string') {
      ingredients = ingredients.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }
    if ((!ingredients || ingredients.length === 0) && val.recipeHtml) {
      const matches = val.recipeHtml.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (matches && matches.length > 0) {
        ingredients = matches.map((m: string) => m.replace(/<[^>]+>/g, '').trim()).filter((m: string) => m.length > 0);
      }
    }
    const newRecipe = {
      ...val,
      recipeHtml: val.recipeHtml || '',
      ingredients
    };

    this.http.post(this.API_URL, newRecipe).subscribe({
      next: () => {
        this.successMessage = 'Item successfully added with ingredients!';
        this.isLoading = false;
        this.recipeForm.reset({
          category: 'Main Course',
          cuisine: 'Indian',
          isVeg: true,
          prepTime: '10 mins',
          cookTime: '15 mins',
          totalTime: '25 mins',
          servings: 1,
          ingredients: '',
          instructions: '',
          recipeHtml: ''
        });
        this.loadRecipes();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to add item.';
        this.isLoading = false;
      }
    });
  }

  deleteRecipe(id: any) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    this.http.delete(`${this.API_URL}/${id}`).subscribe({
      next: () => {
        this.successMessage = 'Item deleted.';
        this.loadRecipes();
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete item.';
      }
    });
  }
}
