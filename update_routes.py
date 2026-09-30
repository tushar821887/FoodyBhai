with open("src/app/app.routes.ts", "r") as f:
    content = f.read()

import re

new_routes = """export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'recipe/:slug', loadComponent: () => import('./pages/recipe-detail/recipe-detail').then(m => m.RecipeDetail) },
  { path: 'category/:slug', loadComponent: () => import('./pages/category/category').then(m => m.Category) },
  { path: 'menu', loadComponent: () => import('./pages/menu/menu').then(m => m.MenuComponent) },
  { path: 'blog', loadComponent: () => import('./pages/blog/blog').then(m => m.Blog) },
  { path: 'blog/:slug', loadComponent: () => import('./pages/blog-detail/blog-detail').then(m => m.BlogDetail) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },
  { path: 'terms', loadComponent: () => import('./pages/terms/terms').then(m => m.Terms) },
  { path: 'disclaimer', loadComponent: () => import('./pages/disclaimer/disclaimer').then(m => m.Disclaimer) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) }
];"""

content = re.sub(r'export const routes: Routes = \[.*?\];', new_routes, content, flags=re.DOTALL)

with open("src/app/app.routes.ts", "w") as f:
    f.write(content)

with open("src/app/app.routes.server.ts", "r") as f:
    content2 = f.read()

new_server = """export const serverRoutes: ServerRoute[] = [
  {
    path: 'recipe/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'category/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];"""

content2 = re.sub(r'export const serverRoutes: ServerRoute\[\] = \[.*?\];', new_server, content2, flags=re.DOTALL)

with open("src/app/app.routes.server.ts", "w") as f:
    f.write(content2)
