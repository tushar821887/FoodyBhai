import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero implements OnInit {
  restaurantStats: any = { averageRating: 4.1, totalReviews: 0 };
  
  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.orderService.getRestaurantStats().subscribe({
        next: (stats) => {
          if (stats && stats.totalReviews > 0) {
            this.restaurantStats = stats;
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  openZomatoStore(){
    window.location.href='https://www.zomato.com/meerut/foody-bhai-mohan-puri/order';
  }
}
