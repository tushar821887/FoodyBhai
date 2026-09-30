import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../services/recipe.service';
import { CartService } from '../../services/cart.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-menu-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-card.html',
  styleUrl: './menu-card.css'
})
export class MenuCard implements OnInit {
  @Input() item!: Recipe;
  quantity$: Observable<number> = of(0);

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.quantity$ = this.cartService.getQuantity(this.item.id);
  }

  addToCart() {
    this.cartService.addToCart(this.item);
  }
  
  increaseQuantity() {
    this.cartService.addToCart(this.item);
  }

  decreaseQuantity(currentQty: number | null) {
    if (currentQty !== null) {
      this.cartService.updateQuantity(this.item.id, currentQty - 1);
    }
  }
}
