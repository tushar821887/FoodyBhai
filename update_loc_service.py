with open("src/app/services/location.service.ts", "r") as f:
    content = f.read()

new_constructor = """
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.LOCATION_KEY);
      if (saved) {
        this.locationSubject.next(saved);
      } else {
        // Default to Meerut, no need to ask automatically
        this.saveLocation("Meerut, Uttar Pradesh");
      }
    }
  }
"""

import re
content = re.sub(r'  constructor.*?\}', new_constructor, content, flags=re.DOTALL)

with open("src/app/services/location.service.ts", "w") as f:
    f.write(content)
