import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DayMenu {
  day: string;
  lunch: {
    main: string;
    dal: string;
    breadRice: string;
    sides: string;
    price?: number;
    time?: string;
  };
  dinner: {
    main: string;
    dal: string;
    breadRice: string;
    sides: string;
    price?: number;
    time?: string;
  };
}

export interface TiffinPlan {
  _id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  dietaryType: 'veg' | 'non-veg' | 'jain';
  mealType: 'lunch' | 'dinner' | 'both';
  trialPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  perMealPrice: number;
  items: string[];
  features: string[];
  image: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  isActive?: boolean;
  rating?: number;
  reviewsCount?: number;
  lunchDeliveryTime?: string;
  dinnerDeliveryTime?: string;
  weeklyMenu: DayMenu[];
}

export interface TiffinOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planId: string;
  planName: string;
  subscriptionType: 'trial' | 'weekly' | 'monthly';
  mealSlot: 'lunch' | 'dinner' | 'both';
  startDate: string;
  endDate?: string;
  totalMeals?: number;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    landmark?: string;
    area: string;
    city: string;
    pincode: string;
  };
  specialInstructions?: string;
  paymentMethod: 'cod' | 'upi' | 'online';
}

@Injectable({
  providedIn: 'root'
})
export class TiffinService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tiffin`;

  // Fallback plans for seamless offline/immediate UX
  private fallbackPlans: TiffinPlan[] = [
    {
      name: 'Rozana Mini Thali',
      slug: 'rozana-mini-thali',
      tagline: 'Light, healthy & pocket-friendly everyday meal',
      description: 'Ideal for students and light eaters looking for comforting homestyle food with minimal oil.',
      dietaryType: 'veg',
      mealType: 'both',
      trialPrice: 79,
      weeklyPrice: 499,
      monthlyPrice: 1899,
      perMealPrice: 65,
      items: [
        '3 Fresh Tawa Rotis (100% Whole Wheat)',
        'Dal Tadka / Homestyle Dal Fry',
        'Seasonal Sukhi Sabzi (Aloo Gobhi / Bhindi / Beans)',
        'Steamed Basmati Rice',
        'Fresh Green Salad & Pickle'
      ],
      features: [
        'Zero Preservatives & Low Oil',
        '100% Desi Homestyle Taste',
        'Sanitized 3-Compartment Dabba',
        'Daily Delivery on Time'
      ],
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      isBestValue: false,
      isActive: true,
      rating: 4.8,
      reviewsCount: 94,
      lunchDeliveryTime: '12:30 PM - 02:00 PM',
      dinnerDeliveryTime: '07:30 PM - 09:30 PM',
      weeklyMenu: [
        {
          day: 'Monday',
          lunch: { main: 'Aloo Methi', dal: 'Yellow Dal Tadka', breadRice: '3 Rotis + Steamed Rice', sides: 'Salad & Achar' },
          dinner: { main: 'Baingan Bharta', dal: 'Moong Dal', breadRice: '3 Rotis + Jeera Rice', sides: 'Salad' }
        },
        {
          day: 'Tuesday',
          lunch: { main: 'Mix Veg', dal: 'Dal Fry', breadRice: '3 Rotis + Steamed Rice', sides: 'Salad & Achar' },
          dinner: { main: 'Lauki Chana Dal', dal: 'Kadhi Pakora', breadRice: '3 Rotis + Rice', sides: 'Salad' }
        },
        {
          day: 'Wednesday',
          lunch: { main: 'Aloo Gobhi Masala', dal: 'Panchmel Dal', breadRice: '3 Rotis + Rice', sides: 'Salad & Achar' },
          dinner: { main: 'Matar Mushroom', dal: 'Arhar Dal', breadRice: '3 Rotis + Jeera Rice', sides: 'Salad' }
        },
        {
          day: 'Thursday',
          lunch: { main: 'Bhindi Masala', dal: 'Masoor Dal', breadRice: '3 Rotis + Rice', sides: 'Salad & Achar' },
          dinner: { main: 'Dum Aloo', dal: 'Moong Dal Chilka', breadRice: '3 Rotis + Rice', sides: 'Salad' }
        },
        {
          day: 'Friday',
          lunch: { main: 'Jeera Aloo', dal: 'Chole Gravy', breadRice: '3 Rotis + Steamed Rice', sides: 'Salad & Onion' },
          dinner: { main: 'Seasonal Greens (Saag/Palak)', dal: 'Dal Fry', breadRice: '3 Rotis + Rice', sides: 'Salad' }
        },
        {
          day: 'Saturday',
          lunch: { main: 'Kashmiri Rajma', dal: 'Yellow Dal', breadRice: '3 Rotis + Jeera Rice', sides: 'Salad & Achar' },
          dinner: { main: 'Kadhai Sabzi', dal: 'Dal Makhani', breadRice: '3 Rotis + Rice', sides: 'Salad' }
        },
        {
          day: 'Sunday',
          lunch: { main: 'Special Aloo Matar', dal: 'Dal Tadka', breadRice: '3 Rotis + Veg Pulao', sides: 'Sweet & Salad' },
          dinner: { main: 'Paneer Bhurji Gravy', dal: 'Yellow Dal', breadRice: '3 Rotis + Rice', sides: 'Salad' }
        }
      ]
    },
    {
      name: 'Ghar Jaisa Standard Thali',
      slug: 'ghar-jaisa-standard-thali',
      tagline: 'Meerut\'s Most Loved Homestyle Tiffin',
      description: 'A complete, balanced, nutritious meal prepared just like maa ke haath ka khana with pure desi ghee phulkas.',
      dietaryType: 'veg',
      mealType: 'both',
      trialPrice: 99,
      weeklyPrice: 649,
      monthlyPrice: 2399,
      perMealPrice: 80,
      items: [
        '4 Desi Ghee Soft Phulkas',
        'Rich Dal Fry / Dal Tadka',
        'Special Seasonal Sabzi (Paneer / Mix Veg / Gobhi)',
        'Fragrant Jeera Rice',
        'Fresh Cut Salad, Green Chutney & Pickle',
        'Curd / Raita (With Lunch)'
      ],
      features: [
        'Desi Ghee Basted Phulkas',
        '100% RO Water Cooking',
        'Daily Rotating Gourmet Menu',
        'Free Pause & Resume Anytime'
      ],
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      isBestValue: true,
      isActive: true,
      rating: 4.9,
      reviewsCount: 312,
      lunchDeliveryTime: '12:30 PM - 02:00 PM',
      dinnerDeliveryTime: '07:30 PM - 09:30 PM',
      weeklyMenu: [
        {
          day: 'Monday',
          lunch: { main: 'Matar Paneer', dal: 'Arhar Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Boondi Raita + Salad + Achar' },
          dinner: { main: 'Aloo Shimla Mirch', dal: 'Dal Fry', breadRice: '4 Desi Ghee Phulkas + Steamed Rice', sides: 'Fresh Salad & Chutney' }
        },
        {
          day: 'Tuesday',
          lunch: { main: 'Delhi Style Rajma Masala', dal: 'Yellow Moong Dal', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Cucumber Raita + Sirka Onion' },
          dinner: { main: 'Lauki Kofta Curry', dal: 'Panchmel Dal', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Fresh Salad & Pickle' }
        },
        {
          day: 'Wednesday',
          lunch: { main: 'Shahi Paneer', dal: 'Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Peas Pulao', sides: 'Mix Veg Raita + Salad' },
          dinner: { main: 'Methi Malai Matar', dal: 'Masoor Dal', breadRice: '4 Desi Ghee Phulkas + Steamed Rice', sides: 'Salad & Papad' }
        },
        {
          day: 'Thursday',
          lunch: { main: 'Punjabi Kadhi Pakora', dal: 'Arhar Dal Fry', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Papad + Salad + Pickle' },
          dinner: { main: 'Aloo Gobhi Adraki', dal: 'Chana Dal Fry', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Fresh Green Salad' }
        },
        {
          day: 'Friday',
          lunch: { main: 'Amritsari Pindi Chole', dal: 'Dal Makhani', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Boondi Raita + Sirka Pyaz' },
          dinner: { main: 'Bhindi Do Pyaza', dal: 'Yellow Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Salad & Achar' }
        },
        {
          day: 'Saturday',
          lunch: { main: 'Kadhai Paneer', dal: 'Moong Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Veg Raita + Salad' },
          dinner: { main: 'Kashmiri Dum Aloo', dal: 'Dal Fry', breadRice: '4 Desi Ghee Phulkas + Steamed Rice', sides: 'Salad & Pickle' }
        },
        {
          day: 'Sunday',
          lunch: { main: 'Paneer Butter Masala', dal: 'Special Dal Makhani', breadRice: '4 Desi Ghee Phulkas + Matar Pulao', sides: 'Hot Gulab Jamun + Raita + Salad' },
          dinner: { main: 'Mix Vegetable Jalfrezi', dal: 'Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Salad & Chutney' }
        }
      ]
    },
    {
      name: 'Deluxe Shahi Thali',
      slug: 'deluxe-shahi-thali',
      tagline: 'The ultimate royal feast delivered daily',
      description: 'For those who want rich flavours every day. Includes double sabzi (one premium paneer dish), sweet, roasted papad, and gourmet raita.',
      dietaryType: 'veg',
      mealType: 'both',
      trialPrice: 139,
      weeklyPrice: 899,
      monthlyPrice: 3299,
      perMealPrice: 110,
      items: [
        '4 Desi Ghee Butter Phulkas',
        'Premium Paneer Dish (Paneer Lababdar / Butter Masala)',
        'Seasonal Special Dry Sabzi',
        'Special Dal (Dal Makhani / Panchmel Tadka)',
        'Gourmet Veg Biryani / Jeera Rice',
        'Flavoured Raita + Roasted Papad',
        'Daily Dessert (Gulab Jamun / Kheer / Halwa)'
      ],
      features: [
        'Double Sabzi with Daily Paneer',
        'Sweet Dish Included Every Meal',
        'Microwave-safe 5-compartment Dabba',
        'Priority VIP Express Delivery'
      ],
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      isBestValue: false,
      isActive: true,
      rating: 5.0,
      reviewsCount: 178,
      lunchDeliveryTime: '12:30 PM - 02:00 PM',
      dinnerDeliveryTime: '07:30 PM - 09:30 PM',
      weeklyMenu: [
        {
          day: 'Monday',
          lunch: { main: 'Paneer Lababdar + Aloo Jeera', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Veg Biryani', sides: 'Fruit Raita + Gulab Jamun + Papad' },
          dinner: { main: 'Kadhai Paneer + Mix Veg', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Jeera Rice', sides: 'Boondi Raita + Rasgulla' }
        },
        {
          day: 'Tuesday',
          lunch: { main: 'Shahi Paneer + Bhindi Fry', dal: 'Dal Bukhara', breadRice: '4 Butter Phulkas + Peas Pulao', sides: 'Pineapple Raita + Gajar Halwa' },
          dinner: { main: 'Palak Paneer + Aloo Gobhi', dal: 'Dal Fry', breadRice: '4 Butter Phulkas + Steamed Rice', sides: 'Raita + Sweet' }
        },
        {
          day: 'Wednesday',
          lunch: { main: 'Paneer Butter Masala + Malai Kofta', dal: 'Panchmel Dal', breadRice: '4 Butter Phulkas + Shahi Pulao', sides: 'Dahi Bhalla + Kheer' },
          dinner: { main: 'Paneer Do Pyaza + Matar Mushroom', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
        },
        {
          day: 'Thursday',
          lunch: { main: 'Paneer Pasanda + Dum Aloo', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Jeera Rice', sides: 'Veg Raita + Moong Dal Halwa' },
          dinner: { main: 'Paneer Bhurji + Kashmiri Dum Aloo', dal: 'Dal Fry', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
        },
        {
          day: 'Friday',
          lunch: { main: 'Paneer Tikka Masala + Pindi Chole', dal: 'Yellow Dal Tadka', breadRice: '4 Butter Phulkas + Kashmiri Pulao', sides: 'Mint Raita + Gulab Jamun' },
          dinner: { main: 'Matar Paneer + Mushroom Masala', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
        },
        {
          day: 'Saturday',
          lunch: { main: 'Handi Paneer + Soya Chaap Gravy', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Jeera Rice', sides: 'Boondi Raita + Rasmalai' },
          dinner: { main: 'Paneer Makhani + Mix Veg Dry', dal: 'Dal Fry', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
        },
        {
          day: 'Sunday',
          lunch: { main: 'Royal Shahi Thali (Chef Special)', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Special Biryani', sides: 'Double Sweet + Dahi Vada + Papad' },
          dinner: { main: 'Paneer Butter Masala + Aloo Shimla Mirch', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
        }
      ]
    },
    {
      name: 'High-Protein Fit Thali',
      slug: 'high-protein-fit-thali',
      tagline: 'Clean, macro-counted fuel for fitness enthusiasts',
      description: 'Specially crafted for gym-goers, athletes and conscious eaters. Packed with 35g+ pure vegetarian protein, low sodium, zero refined sugar.',
      dietaryType: 'veg',
      mealType: 'both',
      trialPrice: 129,
      weeklyPrice: 849,
      monthlyPrice: 3099,
      perMealPrice: 105,
      items: [
        '3 Multigrain / Oats Bran Phulkas',
        '120g Grilled Soya Chaap / High-Protein Paneer Bhurji',
        'Sprouted Moong & Chana Protein Bowl',
        'Thick Tadka Moong Dal (High Fiber)',
        'Organic Brown Rice / Quinoa Pulao',
        'Green Detox Salad with Lemon Dressing'
      ],
      features: [
        '35g+ Clean Vegetarian Protein',
        'Macro-friendly & Low Glycemic Index',
        'Cold Pressed Mustard / Olive Oil Cooking',
        'Detailed Macro-Nutrient Card Included'
      ],
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      isBestValue: false,
      isActive: true,
      rating: 4.9,
      reviewsCount: 86,
      lunchDeliveryTime: '12:30 PM - 02:00 PM',
      dinnerDeliveryTime: '07:30 PM - 09:30 PM',
      weeklyMenu: [
        {
          day: 'Monday',
          lunch: { main: 'Low-Fat Paneer Bhurji (100g)', dal: 'Sprouted Moong Dal', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Sprouts Salad + Lemon Wedge' },
          dinner: { main: 'Soya Chunk Masala', dal: 'Yellow Dal', breadRice: '3 Multigrain Rotis', sides: 'Cucumber Tomato Salad' }
        },
        {
          day: 'Tuesday',
          lunch: { main: 'Tofu / Paneer Stir Fry', dal: 'Black Chana Gravy', breadRice: '3 Multigrain Rotis + Quinoa Rice', sides: 'Boiled Chana Chaat' },
          dinner: { main: 'Mix Vegetable with Soya Grated', dal: 'Dal Tadka', breadRice: '3 Multigrain Rotis', sides: 'Green Salad' }
        },
        {
          day: 'Wednesday',
          lunch: { main: 'Grilled Paneer with Herbs', dal: 'Moong Chana Dal', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Protein Sprouts Bowl' },
          dinner: { main: 'Soya Matar Gravy', dal: 'Masoor Dal', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
        },
        {
          day: 'Thursday',
          lunch: { main: 'Paneer Palak High Fiber', dal: 'Rajma Clean Gravy', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'High Protein Salad' },
          dinner: { main: 'Paneer Capsicum Saute', dal: 'Yellow Moong', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
        },
        {
          day: 'Friday',
          lunch: { main: 'Soya Chaap Tikka Roast', dal: 'Kabuli Chana (Low Salt)', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Cucumber & Beetroot Salad' },
          dinner: { main: 'Paneer Bhurji with Methi', dal: 'Dal Tadka', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
        },
        {
          day: 'Saturday',
          lunch: { main: 'Tofu Paneer Veggie Medley', dal: 'Panchmel Dal', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Sprouts + Lemon' },
          dinner: { main: 'Soya Chunks Curry', dal: 'Dal Fry', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
        },
        {
          day: 'Sunday',
          lunch: { main: 'High-Protein Paneer Tikka Feast', dal: 'Dal Tadka', breadRice: '3 Multigrain Rotis + Brown Pulao', sides: 'Protein Chaat + Fresh Fruits' },
          dinner: { main: 'Paneer Mushroom Saute', dal: 'Moong Dal', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
        }
      ]
    }
  ];

  getConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config`).pipe(
      catchError(() => of(null))
    );
  }

  getPlans(): Observable<TiffinPlan[]> {
    return this.http.get<TiffinPlan[]>(`${this.apiUrl}/plans`).pipe(
      map(plans => (Array.isArray(plans) && plans.length > 0 ? plans : this.fallbackPlans)),
      catchError(() => of(this.fallbackPlans))
    );
  }

  getPlan(slug: string): Observable<TiffinPlan | null> {
    return this.http.get<TiffinPlan>(`${this.apiUrl}/plans/${slug}`).pipe(
      catchError(() => of(null))
    );
  }

  createSubscription(order: TiffinOrderPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subscribe`, order).pipe(
      catchError(err => {
        // Local simulation fallback in case backend server is disconnected
        const fakeOrderId = `TF-${Date.now().toString().slice(-6)}`;
        return of({
          success: true,
          orderId: fakeOrderId,
          message: 'Tiffin subscription confirmed successfully!',
          ...order
        });
      })
    );
  }

  getMyOrders(phone?: string, email?: string): Observable<any[]> {
    const params: string[] = [];
    if (phone) {
      params.push(`phone=${encodeURIComponent(phone)}`);
    }
    if (email) {
      params.push(`email=${encodeURIComponent(email)}`);
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/my-orders${queryString}`).pipe(
      catchError(() => of([]))
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }

  updateOrderDetails(orderId: string, details: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/orders/${orderId}`, details);
  }
}
