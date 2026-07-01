import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { MenuCard } from '../../components/menu-card/menu-card';
import { Menu, MenuItem } from '../../services/menu';

@Component({
  selector: 'app-home',
  imports: [Hero, RouterLink, MenuCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  popularItems: MenuItem[] = [];
  private menuService = inject(Menu);

  ngOnInit() {
    this.menuService.getMenuItems().subscribe(items => {
      // Get a few popular items for home page
      this.popularItems = items.slice(0, 4);
    });
  }
}
