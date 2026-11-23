const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'location-modal', 'location-modal.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const oldImports = `import { LocationService } from '../../services/location.service';`;
const newImports = `import { LocationService } from '../../services/location.service';\nimport { Geolocation } from '@capacitor/geolocation';`;
tsContent = tsContent.replace(oldImports, newImports);

const oldMethod = `  useCurrentLocation() {
    if (isPlatformBrowser(this.platformId) && 'geolocation' in navigator) {
      this.isLoading = true;
      this.errorMsg = '';
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
            },
            error: () => {
              this.isLoading = false;
              this.errorMsg = 'Failed to fetch location data.';
            }
          });
        },
        (error) => {
          this.isLoading = false;
          switch(error.code) {
            case error.PERMISSION_DENIED:
              this.errorMsg = 'Location permission denied. Please enable it in your browser/device settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              this.errorMsg = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              this.errorMsg = 'The request to get user location timed out.';
              break;
            default:
              this.errorMsg = 'An unknown error occurred.';
              break;
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      this.errorMsg = 'Geolocation is not supported by this browser/device.';
    }
  }`;

const newMethod = `  async useCurrentLocation() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoading = true;
      this.errorMsg = '';
      
      try {
        // Use Capacitor Geolocation which works on both Web and Native
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const request = await Geolocation.requestPermissions();
          if (request.location !== 'granted') {
            this.isLoading = false;
            this.errorMsg = 'Location permission denied. Please enable it in your settings.';
            return;
          }
        }
        
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
          },
          error: () => {
            this.isLoading = false;
            this.errorMsg = 'Failed to fetch location data.';
          }
        });
      } catch (error: any) {
        this.isLoading = false;
        this.errorMsg = error.message || 'Failed to get your current location. Please try searching instead.';
      }
    }
  }`;

tsContent = tsContent.replace(oldMethod, newMethod);
fs.writeFileSync(tsPath, tsContent);
console.log('Fixed geolocation for capacitor');
