import { Routes } from '@angular/router';
import { OrdersPage } from './pages/orders/orders.page';
import { LoginPage } from './pages/login/login.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: OrdersPage, data: { view: 'dashboard' } },
  { path: 'orders', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'history', component: OrdersPage, data: { view: 'history' } },
  { path: 'payments', component: OrdersPage, data: { view: 'payments' } },
  { path: 'agents', component: OrdersPage, data: { view: 'agents' } },
  { path: 'menu', component: OrdersPage, data: { view: 'menu' } },
  { path: 'users', component: OrdersPage, data: { view: 'users' } },
  { path: 'coupons', component: OrdersPage, data: { view: 'coupons' } },
  { path: 'contacts', component: OrdersPage, data: { view: 'contacts' } },
  { path: 'cancel-requests', component: OrdersPage, data: { view: 'cancel-requests' } },
  { path: 'settings', component: OrdersPage, data: { view: 'settings' } },
  { path: 'banner', component: OrdersPage, data: { view: 'banner' } },
  { path: 'theme', component: OrdersPage, data: { view: 'theme' } },
  { path: 'cms', component: OrdersPage, data: { view: 'cms' } },
  { path: '**', redirectTo: 'dashboard' }
];
