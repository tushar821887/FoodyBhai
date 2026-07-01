import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'menu', loadComponent: () => import('./pages/menu/menu').then(m => m.MenuComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'delivery', loadComponent: () => import('./pages/delivery/delivery').then(m => m.Delivery) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: 'gallery', loadComponent: () => import('./pages/gallery/gallery').then(m => m.Gallery) },
  { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },
  { path: '**', redirectTo: '' }
];
