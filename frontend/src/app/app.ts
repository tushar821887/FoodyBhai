import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LocationModalComponent } from './components/location-modal/location-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LocationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Foody Bhai');
}
