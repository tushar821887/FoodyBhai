with open("src/app/components/location-modal/location-modal.html", "r") as f:
    content = f.read()

results_html = """
        <div class="results-list">
          <!-- Local Instant Results -->
          @for (result of localResults; track result.name) {
            <div class="result-item" (click)="selectLocation(result)">
              <i class="fa-solid fa-location-crosshairs" style="color: var(--primary-color);"></i>
              <div class="result-text">
                <span class="result-title">{{result.name}}</span>
                <span class="result-subtitle">{{result.display_name}}</span>
              </div>
            </div>
          }
          
          <!-- API Results (if any) -->
          @for (result of searchResults; track result.place_id) {
            <div class="result-item" (click)="selectLocation(result)">
              <i class="fa-solid fa-map-pin"></i>
              <div class="result-text">
                <span class="result-title">{{result.name}}</span>
                <span class="result-subtitle">{{result.display_name}}</span>
              </div>
            </div>
          }
        </div>
"""

import re
content = re.sub(r'        <div class="results-list" \*ngIf="searchResults.length > 0">.*?        </div>', results_html, content, flags=re.DOTALL)

with open("src/app/components/location-modal/location-modal.html", "w") as f:
    f.write(content)
