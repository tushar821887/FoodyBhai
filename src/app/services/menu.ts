import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Menu {
  private menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Aloo Paratha',
      description: 'Stuffed paratha with spiced potatoes, served with curd & pickle.',
      price: 60,
      category: 'Parathas',
      image: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 2,
      name: 'Paneer Butter Masala',
      description: 'Rich & creamy curry made with paneer, spices, onions, and tomatoes.',
      price: 220,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 3,
      name: 'Veg Biryani',
      description: 'Aromatic basmati rice cooked with fresh vegetables and special spices.',
      price: 180,
      category: 'Rice',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 4,
      name: 'Veg Fried Rice',
      description: 'Classic wok-tossed rice with fresh vegetables and soy sauce.',
      price: 150,
      category: 'Fried Rice',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 5,
      name: 'Masala Maggie',
      description: 'Everyone\'s favorite instant noodles tossed with veggies and special masala.',
      price: 80,
      category: 'Maggie',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 6,
      name: 'White Sauce Pasta',
      description: 'Penne pasta in a rich, creamy white sauce with bell peppers and olives.',
      price: 180,
      category: 'Pasta',
      image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 7,
      name: 'Crispy Veg Pakora',
      description: 'Deep-fried mixed vegetable fritters, perfect for a rainy day snack.',
      price: 120,
      category: 'Snacks',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 8,
      name: 'Butter Naan',
      description: 'Soft and fluffy Indian bread cooked in a tandoor, brushed with butter.',
      price: 45,
      category: 'Breads',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 9,
      name: 'Cold Coffee',
      description: 'Thick, creamy, and refreshing cold coffee blended to perfection.',
      price: 110,
      category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    },
    {
      id: 10,
      name: 'Gulab Jamun (2 pcs)',
      description: 'Classic Indian sweet, deep-fried berry sized balls soaked in rose flavored sugar syrup.',
      price: 60,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    }
  ];

  getCategories(): string[] {
    return [
      'All', 'Breakfast', 'Parathas', 'Main Course', 'Rice', 
      'Fried Rice', 'Maggie', 'Pasta', 'Snacks', 'Salads', 
      'Raita', 'Beverages', 'Breads', 'Desserts'
    ];
  }

  getMenuItems() {
    return of(this.menuItems);
  }
}
