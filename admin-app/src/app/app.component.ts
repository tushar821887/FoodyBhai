import { Component } from '@angular/core';
import { OrdersPage } from './pages/orders/orders.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrdersPage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'admin-app';
}
