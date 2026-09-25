import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CartComponent } from './components/cart/cart';
import { LocationModalComponent } from './components/location-modal/location-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CartComponent, LocationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Foody Bhai');
}
