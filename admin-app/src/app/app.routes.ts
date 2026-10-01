import { Routes } from '@angular/router';
import { OrdersPage } from './pages/orders/orders.page';
import { LoginPage } from './pages/login/login.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', component: OrdersPage },
  { path: '**', redirectTo: '' }
];
