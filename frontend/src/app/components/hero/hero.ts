import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  
  openZomatoStore(){
    window.location.href='https://www.zomato.com/meerut/foody-bhai-mohan-puri/order';
  }
}
