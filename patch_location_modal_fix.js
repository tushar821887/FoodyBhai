const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'location-modal', 'location-modal.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const oldImports = `import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';`;
const newImports = `import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';`;
tsContent = tsContent.replace(oldImports, newImports);

const oldConstructor = `  constructor(
    public locationService: LocationService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}`;
const newConstructor = `  constructor(
    public locationService: LocationService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}`;
tsContent = tsContent.replace(oldConstructor, newConstructor);

const oldMethodRegex = /  async useCurrentLocation\(\) \{[\s\S]*?    \}\n  \}/;

const newMethod = `  async useCurrentLocation() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoading = true;
      this.errorMsg = '';
      this.cdr.detectChanges();
      
      try {
        // Just call getCurrentPosition, the browser/OS will prompt for permissions automatically.
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        this.http.get<any>(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lon}&format=json\`).subscribe({
          next: (data) => {
            this.isLoading = false;
            if (data && data.display_name) {
              const name = data.name || data.address?.suburb || data.address?.neighbourhood || data.display_name.split(',')[0];
              this.selectLocation({ ...data, name: name });
            } else {
              this.errorMsg = 'Could not determine location from coordinates.';
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.errorMsg = 'Failed to fetch location data.';
            this.cdr.detectChanges();
          }
        });
      } catch (error: any) {
        this.isLoading = false;
        this.errorMsg = error.message || 'Failed to get your current location. Please try searching instead.';
        this.cdr.detectChanges();
      }
    }
  }`;

tsContent = tsContent.replace(oldMethodRegex, newMethod);
fs.writeFileSync(tsPath, tsContent);
console.log('Fixed location modal TS');
