const fs = require('fs');
const path = require('path');

// --- HTML ---
const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'location-modal', 'location-modal.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldHtml = `          @if (isLoading) {
            <i class="fa-solid fa-circle-notch fa-spin loading-icon"></i>
          }
        </div>

        @if (errorMsg) {`;

const newHtml = `          @if (isLoading) {
            <i class="fa-solid fa-circle-notch fa-spin loading-icon"></i>
          }
        </div>

        <button class="btn-current-location" (click)="useCurrentLocation()">
          <i class="fa-solid fa-crosshairs"></i> Use Current Location
        </button>

        @if (errorMsg) {`;

htmlContent = htmlContent.replace(oldHtml, newHtml);
fs.writeFileSync(htmlPath, htmlContent);

// --- CSS ---
const cssPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'location-modal', 'location-modal.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
.btn-current-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  margin-bottom: 10px;
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-current-location:hover {
  background-color: #fef3c7;
}
.btn-current-location:active {
  transform: scale(0.98);
}
`;
fs.writeFileSync(cssPath, cssContent);

// --- TS ---
const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'location-modal', 'location-modal.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newTsMethod = `  useCurrentLocation() {
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
  }

  selectLocation(result: any) {`;

tsContent = tsContent.replace("  selectLocation(result: any) {", newTsMethod);
fs.writeFileSync(tsPath, tsContent);

console.log('Fixed location modal');
