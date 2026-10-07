const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'app.ts');
let content = fs.readFileSync(tsPath, 'utf8');

const newImports = `import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { isPlatformBrowser, Location } from '@angular/common';
import { App as CapacitorApp } from '@capacitor/app';
import { Dialog } from '@capacitor/dialog';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LocationModalComponent } from './components/location-modal/location-modal';`;

content = content.replace(/import { Component, signal } from '@angular\/core';[\s\S]*?import { LocationModalComponent } from '.\/components\/location-modal\/location-modal';/, newImports);

const newClass = `export class App implements OnInit {
  protected readonly title = signal('Foody Bhai');

  constructor(
    private router: Router,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupBackButton();
    }
  }

  setupBackButton() {
    CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
      if (this.router.url === '/' || this.router.url === '/home' || this.router.url === '/login' || !canGoBack) {
        // App is on the home page, login page, or can't go back further
        const { value } = await Dialog.confirm({
          title: 'Confirm',
          message: 'Are you sure you want to exit Foody Bhai?',
          okButtonTitle: 'Exit',
          cancelButtonTitle: 'Cancel'
        });
        
        if (value) {
          CapacitorApp.exitApp();
        }
      } else {
        // Not on home page, go back in history
        this.location.back();
      }
    });
  }
}`;

content = content.replace(/export class App \{[\s\S]*\}/, newClass);
fs.writeFileSync(tsPath, content);
console.log('Fixed frontend app.ts');
