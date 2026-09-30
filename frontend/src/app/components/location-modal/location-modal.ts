import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './location-modal.html',
  styleUrls: ['./location-modal.css']
})
export class LocationModalComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: any[] = [];
  isLoading = false;
  errorMsg = '';
  
  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

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


  constructor(
    public locationService: LocationService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


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


  selectLocation(result: any) {
    const address = result.address || {};
    
    // Check if it is in Meerut
    const city = address.city || address.state_district || address.county || '';
    if (result.display_name.toLowerCase().includes('meerut')) { this.locationService.saveLocation(result.display_name); this.locationService.closeLocationModal(); this.errorMsg = ''; this.searchQuery = ''; this.searchResults = []; this.localResults = this.popularLocations; return; }
    const name = result.display_name || '';
    
    if (city.toLowerCase().includes('meerut') || name.toLowerCase().includes('meerut')) {
      // It is Meerut! Save and close
      this.locationService.saveLocation(result.display_name);
      this.locationService.closeLocationModal();
      this.errorMsg = '';
      this.searchQuery = '';
      this.searchResults = [];
    } else {
      // Not Meerut
      this.errorMsg = "Sorry, we are not currently delivering to your location. We only deliver in Meerut area.";
    }
  }

  closeModal() {
    // Only allow closing if they already have a saved location
    if (this.locationService.getLocation()) {
      this.locationService.closeLocationModal();
    } else {
      this.errorMsg = "Please select a valid delivery location first.";
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
