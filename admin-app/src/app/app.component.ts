import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'admin-app';
  
  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);
      }
    });
  }
}
