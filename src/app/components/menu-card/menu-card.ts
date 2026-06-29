import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../services/menu';

@Component({
  selector: 'app-menu-card',
  imports: [CommonModule],
  templateUrl: './menu-card.html',
  styleUrl: './menu-card.css'
})
export class MenuCard {
  @Input() item!: MenuItem;
}
