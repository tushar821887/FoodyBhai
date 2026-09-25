with open("src/app/components/header/header.html", "r") as f:
    content = f.read()

location_html = """
    <!-- Location Selector -->
    <div class="header-location" (click)="locationService.openLocationModal()">
      <i class="fa-solid fa-location-dot location-icon"></i>
      <div class="loc-text">
        <span class="loc-label">Delivering to</span>
        <span class="loc-value">{{ (locationService.location$ | async) || 'Select Location' }} <i class="fa-solid fa-chevron-down"></i></span>
      </div>
    </div>
"""

content = content.replace("    </a>\n\n    <!-- Desktop Nav -->", "    </a>\n" + location_html + "\n    <!-- Desktop Nav -->")

with open("src/app/components/header/header.html", "w") as f:
    f.write(content)
