with open("src/app/components/location-modal/location-modal.ts", "r") as f:
    content = f.read()

popular = """
  popularLocations = [
    { display_name: "Abu Lane, Meerut, Uttar Pradesh", name: "Abu Lane" },
    { display_name: "Shastri Nagar, Meerut, Uttar Pradesh", name: "Shastri Nagar" },
    { display_name: "Saket, Meerut, Uttar Pradesh", name: "Saket" },
    { display_name: "Pallavpuram, Meerut, Uttar Pradesh", name: "Pallavpuram" },
    { display_name: "Ganga Nagar, Meerut, Uttar Pradesh", name: "Ganga Nagar" },
    { display_name: "Sadar Bazaar, Meerut, Uttar Pradesh", name: "Sadar Bazaar" },
    { display_name: "Modipuram, Meerut, Uttar Pradesh", name: "Modipuram" },
    { display_name: "Kanker Khera, Meerut, Uttar Pradesh", name: "Kanker Khera" },
    { display_name: "Meerut Cantt, Meerut, Uttar Pradesh", name: "Meerut Cantt" },
    { display_name: "Begum Bridge, Meerut, Uttar Pradesh", name: "Begum Bridge" },
    { display_name: "Mangal Pandey Nagar, Meerut, Uttar Pradesh", name: "Mangal Pandey Nagar" },
    { display_name: "Thapar Nagar, Meerut, Uttar Pradesh", name: "Thapar Nagar" },
    { display_name: "Bhatwara, Meerut, Uttar Pradesh", name: "Bhatwara" },
    { display_name: "Mohan Puri, Meerut, Uttar Pradesh", name: "Mohan Puri" }
  ];
  localResults: any[] = [];
"""

content = content.replace("  private subscription!: Subscription;", "  private subscription!: Subscription;\n" + popular)

init_logic = """
  ngOnInit() {
    this.localResults = this.popularLocations;
    this.subscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) {
          return of([]);
        }
        this.isLoading = true;
        this.errorMsg = '';
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Meerut')}&format=json&addressdetails=1&countrycodes=in&limit=5`).pipe(
          catchError(() => {
            this.isLoading = false;
            return of([]);
          })
        );
      })
    ).subscribe(results => {
      this.isLoading = false;
      // Merge unique results from API
      const apiResults = results.map(r => ({
        display_name: r.display_name,
        name: r.name || r.display_name.split(',')[0],
        place_id: r.place_id,
        isApi: true
      }));
      this.searchResults = apiResults;
    });
  }

  onSearchChange(query: string) {
    // Instantly filter local results
    if (!query) {
      this.localResults = this.popularLocations;
      this.searchResults = [];
    } else {
      const q = query.toLowerCase();
      this.localResults = this.popularLocations.filter(loc => 
        loc.name.toLowerCase().includes(q) || loc.display_name.toLowerCase().includes(q)
      );
    }
    
    // Trigger API debounce
    this.searchSubject.next(query);
  }
"""

import re
content = re.sub(r'  ngOnInit\(\) \{.*onSearchChange\(query: string\) \{\n    this\.searchSubject\.next\(query\);\n  \}', init_logic, content, flags=re.DOTALL)

# Update selectLocation to accept local formats
content = content.replace("const city = address.city || address.state_district || address.county || '';", "const city = address.city || address.state_district || address.county || '';\n    if (result.display_name.toLowerCase().includes('meerut')) { this.locationService.saveLocation(result.display_name); this.locationService.closeLocationModal(); this.errorMsg = ''; this.searchQuery = ''; this.searchResults = []; this.localResults = this.popularLocations; return; }")

with open("src/app/components/location-modal/location-modal.ts", "w") as f:
    f.write(content)
