import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'recipe/:slug', loadComponent: () => import('./pages/recipe-detail/recipe-detail').then(m => m.RecipeDetail) },
  { path: 'category/:slug', loadComponent: () => import('./pages/category/category').then(m => m.Category) },
  { path: 'recipes', loadComponent: () => import('./pages/menu/menu').then(m => m.MenuComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },
  { path: 'terms', loadComponent: () => import('./pages/terms/terms').then(m => m.Terms) },
  { path: 'disclaimer', loadComponent: () => import('./pages/disclaimer/disclaimer').then(m => m.Disclaimer) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) }
];
