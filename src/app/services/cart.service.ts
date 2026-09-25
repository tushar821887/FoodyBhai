import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Recipe } from './recipe.service';

export interface CartItem {
  recipe: Recipe;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  public totalItems$ = this.items$.pipe(
    map(items => items.reduce((total, item) => total + item.quantity, 0))
  );

  public totalPrice$ = this.items$.pipe(
    map(items => items.reduce((total, item) => total + ((item.recipe.price || 0) * item.quantity), 0))
  );

  private toggleSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.toggleSubject.asObservable();

  addToCart(recipe: Recipe) {
    const currentItems = this.itemsSubject.value;
    const existing = currentItems.find(i => i.recipe.id === recipe.id);
    
    if (existing) {
      existing.quantity += 1;
      this.itemsSubject.next([...currentItems]);
    } else {
      this.itemsSubject.next([...currentItems, { recipe, quantity: 1 }]);
    }
    
    // Automatically open the cart when an item is added
    this.openCart();
  }

  removeFromCart(recipeId: number) {
    const currentItems = this.itemsSubject.value;
    this.itemsSubject.next(currentItems.filter(i => i.recipe.id !== recipeId));
  }

  updateQuantity(recipeId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(recipeId);
      return;
    }
    const currentItems = this.itemsSubject.value;
    const existing = currentItems.find(i => i.recipe.id === recipeId);
    if (existing) {
      existing.quantity = quantity;
      this.itemsSubject.next([...currentItems]);
    }
  }

  clearCart() {
    this.itemsSubject.next([]);
  }

  openCart() {
    this.toggleSubject.next(true);
  }

  closeCart() {
    this.toggleSubject.next(false);
  }

  getWhatsAppLink(): string {
    const items = this.itemsSubject.value;
    if (items.length === 0) return '';
    
    let text = 'Hello Foody Bhai, I would like to order:\n\n';
    let total = 0;
    items.forEach(item => {
      const itemTotal = (item.recipe.price || 0) * item.quantity;
      total += itemTotal;
      text += `- ${item.quantity}x ${item.recipe.title} (₹${itemTotal})\n`;
    });
    
    text += `\n*Total: ₹${total}*`;
    
    return `https://wa.me/918218870579?text=${encodeURIComponent(text)}`;
  }
}
