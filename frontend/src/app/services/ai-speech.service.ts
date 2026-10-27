import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartService } from './cart.service';
import { RecipeService, Recipe } from './recipe.service';

export interface VoiceAction {
  type: 'ADD' | 'REMOVE' | 'SHOW_CART' | 'CLEAR_CART' | 'COUPON' | 'CHECKOUT' | 'NAVIGATE' | 'HELP' | 'INFO';
  title?: string;
  quantity?: number;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiSpeechService {
  private recognition: any = null;
  private isBrowser: boolean;
  private recipesCache: Recipe[] = [];

  // Observables for UI state
  public isListening$ = new BehaviorSubject<boolean>(false);
  public isSpeaking$ = new BehaviorSubject<boolean>(false);
  public isSupported$ = new BehaviorSubject<boolean>(false);
  public isOpen$ = new BehaviorSubject<boolean>(false);
  public transcript$ = new BehaviorSubject<string>('');
  public assistantMessage$ = new BehaviorSubject<string>('Hello! I am Foody AI. What would you like to eat today?');
  public language$ = new BehaviorSubject<string>('en-IN'); // 'en-IN' or 'hi-IN'
  public isMuted$ = new BehaviorSubject<boolean>(false);
  public lastAction$ = new BehaviorSubject<VoiceAction | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private router: Router,
    private cartService: CartService,
    private recipeService: RecipeService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.initRecognition();
      this.loadRecipes();
    }
  }

  private loadRecipes() {
    this.recipeService.getRecipes().subscribe(recipes => {
      if (recipes && Array.isArray(recipes)) {
        this.recipesCache = recipes;
      }
    });
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported$.next(true);
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.language$.value;

        this.recognition.onstart = () => {
          this.zone.run(() => {
            this.isListening$.next(true);
            this.transcript$.next('');
          });
        };

        this.recognition.onresult = (event: any) => {
          this.zone.run(() => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            this.transcript$.next(currentTranscript);

            // If final result, process intent
            if (event.results[event.results.length - 1].isFinal) {
              this.processVoiceCommand(currentTranscript);
            }
          });
        };

        this.recognition.onerror = (event: any) => {
          this.zone.run(() => {
            this.isListening$.next(false);
            if (event.error === 'not-allowed') {
              this.setAssistantMessage('Microphone permission was denied. Please allow microphone access to use voice ordering.');
            } else if (event.error !== 'no-speech') {
              console.warn('Speech recognition error:', event.error);
            }
          });
        };

        this.recognition.onend = () => {
          this.zone.run(() => {
            this.isListening$.next(false);
          });
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization error', e);
        this.isSupported$.next(false);
      }
    } else {
      this.isSupported$.next(false);
    }
  }

  public openAssistant() {
    this.isOpen$.next(true);
    if (this.recipesCache.length === 0) {
      this.loadRecipes();
    }
    // Greet user on first open
    const greeting = this.language$.value === 'hi-IN' 
      ? 'Namaste! Main Foody AI hoon. Aaj aap kya khana pasand karenge?' 
      : 'Hello! I am Foody AI. What delicious dish would you like to order today?';
    this.setAssistantMessage(greeting);
    this.speak(greeting);
  }

  public closeAssistant() {
    this.stopListening();
    this.stopSpeaking();
    this.isOpen$.next(false);
  }

  public toggleAssistant() {
    if (this.isOpen$.value) {
      this.closeAssistant();
    } else {
      this.openAssistant();
    }
  }

  public toggleListening() {
    if (this.isListening$.value) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  public startListening() {
    if (!this.isBrowser || !this.recognition) return;
    this.stopSpeaking();
    try {
      this.recognition.lang = this.language$.value;
      this.recognition.start();
    } catch (e) {
      // If already started, restart
      try {
        this.recognition.stop();
        setTimeout(() => {
          try { this.recognition.start(); } catch (err) {}
        }, 150);
      } catch (err) {}
    }
  }

  public stopListening() {
    if (!this.isBrowser || !this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {}
    this.isListening$.next(false);
  }

  public setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.language$.next(lang);
    if (this.recognition) {
      this.recognition.lang = lang;
    }
    const msg = lang === 'hi-IN' ? 'Language set to Hindi / Hinglish. Boliye, kya order karna hai?' : 'Language set to Indian English. Tell me what you would like to eat!';
    this.setAssistantMessage(msg);
    this.speak(msg);
  }

  public toggleMute() {
    const newState = !this.isMuted$.value;
    this.isMuted$.next(newState);
    if (newState) {
      this.stopSpeaking();
    }
  }

  public speak(text: string) {
    if (!this.isBrowser || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isMuted$.value) return;

    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const cleanText = text.replace(/[*_#₹➜●○⚠️🎉🔥⚡🛵🍔🍕✨🏷️⭐]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = this.language$.value;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice = voices.find(v => 
          (this.language$.value === 'hi-IN' && (v.lang.includes('hi') || v.name.includes('Hindi'))) ||
          (this.language$.value === 'en-IN' && (v.lang.includes('en-IN') || v.name.includes('India')))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        this.zone.run(() => { this.isSpeaking$.next(true); });
      };
      utterance.onend = () => {
        this.zone.run(() => { this.isSpeaking$.next(false); });
      };
      utterance.onerror = () => {
        this.zone.run(() => { this.isSpeaking$.next(false); });
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  public stopSpeaking() {
    if (this.isBrowser && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking$.next(false);
    }
  }

  private setAssistantMessage(msg: string) {
    this.assistantMessage$.next(msg);
  }

  // ─── Natural Language Processing & Menu Matching ─────────────────────────
  public processVoiceCommand(rawTranscript: string) {
    if (!rawTranscript || !rawTranscript.trim()) return;

    const query = rawTranscript.trim().toLowerCase();
    console.log('[Foody AI Speech] Processing query:', query);

    // 1. Intent: CHECKOUT
    if (
      query.includes('checkout') || 
      query.includes('place order') || 
      query.includes('order now') || 
      query.includes('order kardo') || 
      query.includes('bill') ||
      query.includes('payment')
    ) {
      const total = this.cartService.getCurrentTotal();
      if (total <= 0) {
        const msg = 'Your cart is currently empty! Please order some delicious food first.';
        this.setAssistantMessage(msg);
        this.speak(msg);
        this.lastAction$.next({ type: 'INFO', message: msg, success: false });
        return;
      }
      this.router.navigate(['/cart']);
      const msg = `Navigating to checkout! Your cart total is ₹${total}. Please review and confirm your order.`;
      this.setAssistantMessage(msg);
      this.speak(msg);
      this.lastAction$.next({ type: 'CHECKOUT', message: msg, success: true });
      return;
    }

    // 2. Intent: SHOW CART
    if (
      query.includes('show cart') || 
      query.includes('view cart') || 
      query.includes('my cart') || 
      query.includes('cart dikhao') || 
      query.includes('cart mein kya hai') ||
      query.includes('open cart') ||
      query === 'cart'
    ) {
      const items = this.cartService.getItems();
      if (!items || items.length === 0) {
        const msg = 'Your cart is empty. What would you like to order?';
        this.setAssistantMessage(msg);
        this.speak(msg);
        this.lastAction$.next({ type: 'SHOW_CART', message: msg, success: true });
        return;
      }
      const itemNames = items.map(i => `${i.quantity}x ${i.recipe.title}`).join(', ');
      const total = this.cartService.getCurrentTotal();
      const msg = `You have ${items.length} item(s) in your cart: ${itemNames}. Total amount is ₹${total}. Say "Checkout" to place order!`;
      this.setAssistantMessage(msg);
      this.speak(msg);
      this.lastAction$.next({ type: 'SHOW_CART', message: msg, success: true });
      return;
    }

    // 3. Intent: CLEAR CART
    if (
      query.includes('clear cart') || 
      query.includes('empty cart') || 
      query.includes('cart khali kardo') || 
      query.includes('remove all items') ||
      query.includes('delete all')
    ) {
      this.cartService.clearCart();
      const msg = 'Your cart has been cleared successfully.';
      this.setAssistantMessage(msg);
      this.speak(msg);
      this.lastAction$.next({ type: 'CLEAR_CART', message: msg, success: true });
      return;
    }

    // 4. Intent: APPLY COUPON
    if (query.includes('coupon') || query.includes('promo') || query.includes('code') || query.includes('discount')) {
      const match = query.match(/(?:coupon|code|apply)\s+([a-zA-Z0-9]+)/i);
      const code = match ? match[1].toUpperCase() : 'FOODY20';
      const total = this.cartService.getCurrentTotal();
      
      this.cartService.validateAndApplyCoupon(code, total).subscribe({
        next: (res) => {
          if (res && res.valid) {
            const disc = res.discount || 0;
            const msg = `🎉 Coupon ${code} applied successfully! You saved ₹${disc}.`;
            this.setAssistantMessage(msg);
            this.speak(msg);
            this.lastAction$.next({ type: 'COUPON', message: msg, success: true });
          } else {
            const msg = res.message || `Sorry, coupon ${code} is invalid or order minimum not reached.`;
            this.setAssistantMessage(msg);
            this.speak(msg);
            this.lastAction$.next({ type: 'COUPON', message: msg, success: false });
          }
        },
        error: () => {
          const msg = `Coupon ${code} could not be applied. Try FOODY20 or FREEDEL!`;
          this.setAssistantMessage(msg);
          this.speak(msg);
          this.lastAction$.next({ type: 'COUPON', message: msg, success: false });
        }
      });
      return;
    }

    // 5. Intent: REMOVE ITEM FROM CART
    if (query.includes('remove') || query.includes('delete') || query.includes('hatao') || query.includes('hata do')) {
      const itemsInCart = this.cartService.getItems();
      const matchedCartItem = this.findMatchingCartItem(query, itemsInCart);

      if (matchedCartItem) {
        this.cartService.removeFromCart(matchedCartItem.recipe.id || matchedCartItem.recipe._id);
        const msg = `Removed ${matchedCartItem.recipe.title} from your cart. Total is now ₹${this.cartService.getCurrentTotal()}.`;
        this.setAssistantMessage(msg);
        this.speak(msg);
        this.lastAction$.next({ type: 'REMOVE', title: matchedCartItem.recipe.title, message: msg, success: true });
      } else {
        const msg = "I couldn't find that item in your cart to remove.";
        this.setAssistantMessage(msg);
        this.speak(msg);
        this.lastAction$.next({ type: 'REMOVE', message: msg, success: false });
      }
      return;
    }

    // 6. Intent: RECOMMENDATION / SEARCH
    if (query.includes('recommend') || query.includes('best') || query.includes('kya acha') || query.includes('special') || query.includes('popular')) {
      const msg = "Our customer favorites are South Indian Poha, Paneer Butter Masala, and Dal Fry! Just say 'Add 2 Poha' or 'Add Paneer Butter Masala' to order.";
      this.setAssistantMessage(msg);
      this.speak(msg);
      this.lastAction$.next({ type: 'INFO', message: msg, success: true });
      return;
    }

    if (query.includes('veg') || query.includes('shakahari')) {
      const msg = "We have 100% pure vegetarian dishes slow-cooked with fresh ingredients. Try our Dal Fry, Aloo Jeera Masala, or Paneer Do Pyaaza!";
      this.setAssistantMessage(msg);
      this.speak(msg);
      this.lastAction$.next({ type: 'INFO', message: msg, success: true });
      return;
    }

    // 7. Intent: ADD ITEM TO CART (Primary Flow)
    const quantity = this.extractQuantity(query);
    const matchedRecipe = this.findMatchingRecipe(query);

    if (matchedRecipe) {
      if (matchedRecipe.inStock === false) {
        const msg = `Sorry, ${matchedRecipe.title} is currently out of stock. Would you like to order something else?`;
        this.setAssistantMessage(msg);
        this.speak(msg);
        this.lastAction$.next({ type: 'ADD', title: matchedRecipe.title, quantity, message: msg, success: false });
        return;
      }

      this.cartService.addItemsToCart(matchedRecipe, quantity);
      const newTotal = this.cartService.getCurrentTotal();
      const qtyText = quantity > 1 ? `${quantity} plates of ` : '';
      const msg = `✅ Added ${qtyText}${matchedRecipe.title} to your cart! Total is ₹${newTotal}. What else would you like?`;
      this.setAssistantMessage(msg);
      this.speak(msg);
      this.lastAction$.next({ type: 'ADD', title: matchedRecipe.title, quantity, message: msg, success: true });
      return;
    }

    // 8. Fallback / Helpful guidance
    const fallbackMsg = `I heard: "${rawTranscript}". You can say "Add 2 Poha", "Order Dal Fry", "Show my cart", or "Checkout".`;
    this.setAssistantMessage(fallbackMsg);
    this.speak(fallbackMsg);
    this.lastAction$.next({ type: 'HELP', message: fallbackMsg, success: false });
  }

  // ─── Extraction Helpers ──────────────────────────────────────────────────
  private extractQuantity(text: string): number {
    // 1. Direct digits
    const digitMatch = text.match(/\b([1-9]|10)\b/);
    if (digitMatch) {
      return parseInt(digitMatch[1], 10);
    }

    // 2. English words
    const wordsMap: Record<string, number> = {
      one: 1, a: 1, an: 1, single: 1,
      two: 2, double: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10
    };

    // 3. Hindi words
    const hindiMap: Record<string, number> = {
      ek: 1, aik: 1,
      do: 2, doye: 2,
      teen: 3, tin: 3,
      chaar: 4, char: 4,
      paanch: 5, panch: 5,
      chhah: 6, chheh: 6, chhe: 6,
      saat: 7,
      aath: 8, ath: 8,
      nau: 9, no: 9,
      das: 10
    };

    const tokens = text.split(/\s+/);
    for (const t of tokens) {
      if (wordsMap[t] !== undefined) return wordsMap[t];
      if (hindiMap[t] !== undefined) return hindiMap[t];
    }

    return 1;
  }

  private findMatchingRecipe(query: string): Recipe | null {
    if (!this.recipesCache || this.recipesCache.length === 0) return null;

    // Clean query from filler words
    const clean = query
      .replace(/\b(add|order|please|kardo|kar do|plate|plates|portion|portions|bowl|bowls|lao|dena|de do|ek|do|teen|chaar|char|one|two|three|four)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return null;

    let bestRecipe: Recipe | null = null;
    let highestScore = 0;

    for (const recipe of this.recipesCache) {
      const title = recipe.title.toLowerCase();
      const slug = recipe.slug ? recipe.slug.toLowerCase().replace(/-/g, ' ') : '';
      let score = 0;

      // Exact title match or substring
      if (title === clean || slug === clean) {
        score += 100;
      } else if (title.includes(clean) || clean.includes(title)) {
        score += 70;
      } else if (slug.includes(clean) || clean.includes(slug)) {
        score += 65;
      } else {
        // Keyword overlap
        const cleanTokens = clean.split(' ').filter(w => w.length > 2);
        const titleTokens = title.split(/[\s()]+/).filter(w => w.length > 2);

        let matches = 0;
        for (const token of cleanTokens) {
          if (titleTokens.some(t => t.includes(token) || token.includes(t))) {
            matches++;
          }
        }
        if (matches > 0) {
          score += (matches / Math.max(cleanTokens.length, titleTokens.length)) * 50;
        }
      }

      if (score > highestScore && score >= 25) {
        highestScore = score;
        bestRecipe = recipe;
      }
    }

    return bestRecipe;
  }

  private findMatchingCartItem(query: string, items: any[]): any | null {
    if (!items || items.length === 0) return null;
    const clean = query
      .replace(/\b(remove|delete|hatao|hata do|cancel|from cart|ko|se)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    for (const item of items) {
      const title = item.recipe.title.toLowerCase();
      if (title.includes(clean) || clean.includes(title)) {
        return item;
      }
      const tokens = clean.split(' ').filter(t => t.length > 2);
      if (tokens.some(t => title.includes(t))) {
        return item;
      }
    }
    return null;
  }
}
