import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCard } from '../../components/menu-card/menu-card';
import { Menu, MenuItem } from '../../services/menu';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, MenuCard],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
  allItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: string[] = [];
  
  activeCategory: string = 'All';
  searchQuery: string = '';
  vegOnly: boolean = false;
  
  private menuService = inject(Menu);

  ngOnInit() {
    this.categories = this.menuService.getCategories();
    this.menuService.getMenuItems().subscribe(items => {
      this.allItems = items;
      this.filteredItems = items;
    });
  }

  setCategory(category: string) {
    this.activeCategory = category;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  toggleVegOnly() {
    this.vegOnly = !this.vegOnly;
    this.applyFilters();
  }

  resetFilters() {
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.vegOnly = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredItems = this.allItems.filter(item => {
      // Category filter
      const matchCategory = this.activeCategory === 'All' || item.category === this.activeCategory;
      
      // Search filter
      const matchSearch = item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Veg filter
      const matchVeg = !this.vegOnly || item.isVeg;
      
      return matchCategory && matchSearch && matchVeg;
    });
  }
}
