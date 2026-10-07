const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'app.component.ts');
let content = fs.readFileSync(tsPath, 'utf8');

const newImports = `import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from './services/api.service';
import { App as CapacitorApp } from '@capacitor/app';
import { Dialog } from '@capacitor/dialog';`;

content = content.replace(/import { Component, OnInit } from '@angular\/core';[\s\S]*?import { ApiService } from '.\/services\/api.service';/, newImports);

const newClass = `export class AppComponent implements OnInit {
  title = 'admin-app';
  
  constructor(private api: ApiService, private router: Router, private location: Location) {}

  ngOnInit() {
    this.api.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);
      }
    });
    this.setupBackButton();
  }

  setupBackButton() {
    CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
      if (this.router.url === '/orders' || this.router.url === '/login' || !canGoBack) {
        const { value } = await Dialog.confirm({
          title: 'Confirm',
          message: 'Are you sure you want to exit the Admin App?',
          okButtonTitle: 'Exit',
          cancelButtonTitle: 'Cancel'
        });
        
        if (value) {
          CapacitorApp.exitApp();
        }
      } else {
        this.location.back();
      }
    });
  }
}`;

content = content.replace(/export class AppComponent implements OnInit \{[\s\S]*\}/, newClass);
fs.writeFileSync(tsPath, content);
console.log('Fixed admin app.component.ts');
