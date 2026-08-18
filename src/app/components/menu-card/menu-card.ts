import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../services/recipe.service';

@Component({
  selector: 'app-menu-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-card.html',
  styleUrl: './menu-card.css'
})
export class MenuCard {
  @Input() item!: Recipe;
}
