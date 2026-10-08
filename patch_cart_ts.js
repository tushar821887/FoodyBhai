const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend/src/app/pages/cart/cart.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace localStorage reads
content = content.replace("const savedQr = localStorage.getItem('foodybhai_qr');", "this.orderService.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value) { this.qrImageUrl = res.value; this.cdr.detectChanges(); } });");
content = content.replace("const savedUpi = localStorage.getItem('foodybhai_upi');", "this.orderService.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value) { this.upiId = res.value; this.cdr.detectChanges(); } });");
content = content.replace("if (savedQr) this.qrImageUrl = savedQr;", "");
content = content.replace("if (savedUpi) this.upiId = savedUpi;", "");

// Add ChangeDetectorRef to constructor
if (!content.includes('ChangeDetectorRef')) {
  content = content.replace("import { Component, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';", "import { Component, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';");
  content = content.replace("public authService: AuthService,", "public authService: AuthService, private cdr: ChangeDetectorRef,");
}

fs.writeFileSync(filePath, content);
