import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartService } from './cart.service';
import { RecipeService, Recipe } from './recipe.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  action?: {
    type: 'ADD' | 'REMOVE' | 'SHOW_CART' | 'CLEAR_CART' | 'COUPON' | 'CHECKOUT' | 'RECOMMEND' | 'INFO' | 'HELP';
    recipe?: Recipe;
    recipes?: Recipe[];
    quantity?: number;
    total?: number;
    discount?: number;
    couponCode?: string;
  };
  isThinking?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiSpeechService {
  private recognition: any = null;
  private isBrowser: boolean;
  private recipesCache: Recipe[] = [];

  // Observables for Assistant State
  public isListening$ = new BehaviorSubject<boolean>(false);
  public isSpeaking$ = new BehaviorSubject<boolean>(false);
  public isSupported$ = new BehaviorSubject<boolean>(false);
  public isOpen$ = new BehaviorSubject<boolean>(false);
  public isThinking$ = new BehaviorSubject<boolean>(false);
  public isMuted$ = new BehaviorSubject<boolean>(false);
  public language$ = new BehaviorSubject<'en-IN' | 'hi-IN'>('en-IN');
  public interimTranscript$ = new BehaviorSubject<string>('');
  
  // Full conversational message thread
  public messages$ = new BehaviorSubject<ChatMessage[]>([]);

  // Common Indian food synonyms and phonetic mapping
  private foodSynonyms: Record<string, string> = {
    'pohe': 'poha',
    'pohaa': 'poha',
    'daal': 'dal',
    'dhal': 'dal',
    'dahl': 'dal',
    'panir': 'paneer',
    'panner': 'paneer',
    'makroni': 'macaroni',
    'pasta': 'macaroni',
    'chawal': 'rice',
    'bhaat': 'rice',
    'bhat': 'rice',
    'pulav': 'pulao',
    'puloo': 'pulao',
    'biriyani': 'biryani',
    'choley': 'chole',
    'channa': 'chole',
    'rotis': 'roti',
    'phulka': 'roti',
    'chapati': 'roti',
    'pop corn': 'popcorn',
    'eggroll': 'egg roll',
    'ande ka roll': 'egg roll',
    'colddrink': 'cold drinks',
    'pepsi': 'cold drinks',
    'coke': 'cold drinks',
    'sharbat': 'drinks',
    'nimbu pani': 'lemonade'
  };

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
      this.initWelcomeMessage();
    }
  }

  private initWelcomeMessage() {
    const welcome: ChatMessage = {
      id: 'welcome-' + Date.now(),
      sender: 'assistant',
      text: "👋 Namaste! I'm **Foody AI**, your smart personal food ordering copilot.\n\nYou can **talk** or **type** to order dishes, check the cart, apply promo discounts, or ask for chef recommendations!",
      timestamp: new Date()
    };
    this.messages$.next([welcome]);
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
            this.interimTranscript$.next('');
          });
        };

        this.recognition.onresult = (event: any) => {
          this.zone.run(() => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            this.interimTranscript$.next(current);

            if (event.results[event.results.length - 1].isFinal) {
              this.handleUserInput(current, true);
            }
          });
        };

        this.recognition.onerror = (event: any) => {
          this.zone.run(() => {
            this.isListening$.next(false);
            if (event.error === 'not-allowed') {
              this.addAssistantMessage('⚠️ Microphone access was denied. You can continue typing your order below or enable microphone permission in your browser.');
            }
          });
        };

        this.recognition.onend = () => {
          this.zone.run(() => {
            this.isListening$.next(false);
          });
        };
      } catch (e) {
        console.warn('SpeechRecognition error', e);
        this.isSupported$.next(false);
      }
    } else {
      this.isSupported$.next(false);
    }
  }

  // ─── Dialog & Window Controls ───────────────────────────────────────────
  public openAssistant() {
    this.isOpen$.next(true);
    if (this.recipesCache.length === 0) {
      this.loadRecipes();
    }
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
    } catch {
      try {
        this.recognition.stop();
        setTimeout(() => {
          try { this.recognition.start(); } catch {}
        }, 150);
      } catch {}
    }
  }

  public stopListening() {
    if (!this.isBrowser || !this.recognition) return;
    try { this.recognition.stop(); } catch {}
    this.isListening$.next(false);
  }

  public setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.language$.next(lang);
    if (this.recognition) {
      this.recognition.lang = lang;
    }
    const msg = lang === 'hi-IN' 
      ? '🌐 भाषा बदलकर हिंदी/हिंग्लिश कर दी गई है। बोलिए या टाइप कीजिए, क्या आर्डर करना है?'
      : '🌐 Language set to Indian English. Tell or type what you would like to order!';
    this.addAssistantMessage(msg, undefined, true);
  }

  public toggleMute() {
    const newState = !this.isMuted$.value;
    this.isMuted$.next(newState);
    if (newState) {
      this.stopSpeaking();
    }
  }

  public clearMessages() {
    this.initWelcomeMessage();
  }

  // ─── User Input Pipeline (Typed or Spoken) ──────────────────────────────
  public sendTextMessage(text: string) {
    if (!text || !text.trim()) return;
    this.handleUserInput(text.trim(), false);
  }

  private handleUserInput(rawInput: string, wasSpoken: boolean) {
    if (!rawInput.trim()) return;

    // 1. Append user message to thread
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: rawInput.trim(),
      timestamp: new Date()
    };
    this.messages$.next([...this.messages$.value, userMsg]);
    this.interimTranscript$.next('');
    this.isThinking$.next(true);

    // 2. Process with Natural Language Parser & Auto-Correction
    setTimeout(() => {
      this.zone.run(() => {
        this.processQuery(rawInput.trim(), wasSpoken);
        this.isThinking$.next(false);
      });
    }, 250);
  }

  // ─── AI Query Processing & Agentic Tools ─────────────────────────────────
  private processQuery(rawText: string, shouldSpeak: boolean) {
    const query = rawText.toLowerCase().trim();
    const correctedQuery = this.autoCorrectFoodWords(query);

    // INTENT 1: CHECKOUT & PLACE ORDER
    if (
      this.matchesAny(correctedQuery, [
        'checkout', 'place order', 'order now', 'bill', 'payment', 'pay now',
        'order kardo', 'order place', 'ghar bhejo', 'deliver now'
      ])
    ) {
      const items = this.cartService.getItems();
      const total = this.cartService.getCurrentTotal();
      if (!items || items.length === 0 || total <= 0) {
        const text = '⚠️ Your cart is currently empty! Please add some delicious dishes first before checking out.';
        this.addAssistantMessage(text, undefined, shouldSpeak);
        return;
      }
      this.router.navigate(['/cart']);
      const text = `🚀 Navigating to checkout! Your cart has **${items.length} item(s)** totaling **₹${total}**. Review your order and tap "Place Order".`;
      this.addAssistantMessage(text, { type: 'CHECKOUT', total }, shouldSpeak);
      return;
    }

    // INTENT 2: SHOW / INSPECT CART
    if (
      this.matchesAny(correctedQuery, [
        'show cart', 'view cart', 'my cart', 'items in cart', 'cart me kya hai',
        'cart dikhao', 'open cart', 'current total', 'bill kitna hua'
      ]) || correctedQuery === 'cart'
    ) {
      const items = this.cartService.getItems();
      const total = this.cartService.getCurrentTotal();
      if (!items || items.length === 0) {
        const text = '🛒 Your cart is currently empty. Would you like me to recommend our bestselling dishes?';
        this.addAssistantMessage(text, { type: 'SHOW_CART', total: 0 }, shouldSpeak);
        return;
      }
      const summaryList = items.map(i => `• ${i.quantity}x **${i.recipe.title}** (₹${(i.recipe.price || 0) * i.quantity})`).join('\n');
      const text = `🛒 **Your Cart Summary (${items.length} items):**\n\n${summaryList}\n\n**Subtotal: ₹${total}**\n\nSay *"Checkout"* to place your order, or ask to add more dishes!`;
      this.addAssistantMessage(text, { type: 'SHOW_CART', total }, shouldSpeak);
      return;
    }

    // INTENT 3: CLEAR CART
    if (
      this.matchesAny(correctedQuery, [
        'clear cart', 'empty cart', 'cart khali kardo', 'delete all items',
        'remove everything', 'saaf kardo'
      ])
    ) {
      this.cartService.clearCart();
      const text = '🗑️ Your cart has been completely cleared. What would you like to add instead?';
      this.addAssistantMessage(text, { type: 'CLEAR_CART', total: 0 }, shouldSpeak);
      return;
    }

    // INTENT 4: APPLY COUPON CODE
    if (
      this.matchesAny(correctedQuery, ['coupon', 'promo', 'code', 'discount', 'offer', 'voucher', 'discount lagao'])
    ) {
      const extractedCode = this.extractCouponCode(correctedQuery);
      const total = this.cartService.getCurrentTotal();

      if (total <= 0) {
        const text = `💡 Coupon **${extractedCode}** is ready! Please add items to your cart first so we can apply the discount to your order.`;
        this.addAssistantMessage(text, { type: 'COUPON', couponCode: extractedCode }, shouldSpeak);
        return;
      }

      this.cartService.validateAndApplyCoupon(extractedCode, total).subscribe({
        next: (res) => {
          if (res && res.valid) {
            const disc = res.discount || 0;
            const text = `🎉 **Success!** Coupon code **${extractedCode}** applied! You saved **₹${disc}** on this order!`;
            this.addAssistantMessage(text, { type: 'COUPON', couponCode: extractedCode, discount: disc, total: Math.max(0, total - disc) }, shouldSpeak);
          } else {
            const reason = res.message || `Coupon ${extractedCode} requires a higher order amount or has expired.`;
            const text = `⚠️ Could not apply coupon **${extractedCode}**: ${reason}\n\nTry using **FOODY20** (20% OFF) or **FREEDEL** (Free Delivery)!`;
            this.addAssistantMessage(text, { type: 'COUPON', couponCode: extractedCode }, shouldSpeak);
          }
        },
        error: () => {
          const text = `⚠️ Coupon **${extractedCode}** is not active. Available active coupons: **FOODY20**, **FOODY30**, and **FREEDEL**!`;
          this.addAssistantMessage(text, { type: 'COUPON', couponCode: extractedCode }, shouldSpeak);
        }
      });
      return;
    }

    // INTENT 5: REMOVE ITEM FROM CART
    if (
      this.matchesAny(correctedQuery, ['remove', 'delete', 'hatao', 'hata do', 'cancel item', 'nikaal do', 'drop'])
    ) {
      const itemsInCart = this.cartService.getItems();
      const matchedCartItem = this.findMatchingCartItem(correctedQuery, itemsInCart);

      if (matchedCartItem) {
        this.cartService.removeFromCart(Number(matchedCartItem.recipe.id || matchedCartItem.recipe._id || 0));
        const newTotal = this.cartService.getCurrentTotal();
        const text = `🗑️ Removed **${matchedCartItem.recipe.title}** from your cart.\n\nUpdated cart total: **₹${newTotal}**.`;
        this.addAssistantMessage(text, { type: 'REMOVE', recipe: matchedCartItem.recipe, total: newTotal }, shouldSpeak);
      } else {
        const text = "❓ I couldn't find that dish in your active cart to remove. Say *'Show cart'* to review your current items.";
        this.addAssistantMessage(text, undefined, shouldSpeak);
      }
      return;
    }

    // INTENT 6: RECOMMENDATIONS & DISH DISCOVERY
    if (
      this.matchesAny(correctedQuery, [
        'recommend', 'special', 'kya acha hai', 'best seller', 'popular',
        'favorite', 'top dishes', 'kya mangwau', 'suggest'
      ])
    ) {
      const recommendations = this.recipesCache.slice(0, 3);
      const text = `👨‍🍳 **Chef's Top Recommendations for You:**\n\n` +
        recommendations.map((r, i) => `${i + 1}. **${r.title}** — ₹${r.price}\n   *${r.description || 'Authentic homestyle taste'}*`).join('\n\n') +
        `\n\nTap any card below or say *"Add ${recommendations[0]?.title || 'Poha'}"* to order!`;
      this.addAssistantMessage(text, { type: 'RECOMMEND', recipes: recommendations }, shouldSpeak);
      return;
    }

    // INTENT 7: VEG ONLY / JAIN INQUIRIES
    if (this.matchesAny(correctedQuery, ['pure veg', 'vegetarian', 'shakahari', 'veg only', 'bina pyaz'])) {
      const vegDishes = this.recipesCache.filter(r => r.isVeg).slice(0, 3);
      const text = `🌱 **100% Pure Vegetarian Delicacies:**\n\n` +
        vegDishes.map((r, i) => `• **${r.title}** (₹${r.price}) — *${r.category}*`).join('\n') +
        `\n\nAll our veg curries and snacks are prepared with separate utensils and farm-fresh ingredients.`;
      this.addAssistantMessage(text, { type: 'RECOMMEND', recipes: vegDishes }, shouldSpeak);
      return;
    }

    // INTENT 8: BUDGET / PRICE FILTER ("under 100", "under 150 rs")
    const priceMatch = correctedQuery.match(/(?:under|below|sasta|kam|within)\s*(?:rs|rupees|₹)?\s*(\d+)/i);
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1], 10);
      const affordable = this.recipesCache.filter(r => (r.price || 0) <= maxPrice).slice(0, 4);
      if (affordable.length > 0) {
        const text = `💰 **Dishes under ₹${maxPrice}:**\n\n` +
          affordable.map(r => `• **${r.title}** — ₹${r.price}`).join('\n') +
          `\n\nTell me which one you'd like to order!`;
        this.addAssistantMessage(text, { type: 'RECOMMEND', recipes: affordable }, shouldSpeak);
        return;
      }
    }

    // INTENT 9: PRIMARY FLOW — ORDER / ADD DISH TO CART
    const quantity = this.extractQuantity(correctedQuery);
    const matchedRecipe = this.findMatchingRecipe(correctedQuery);

    if (matchedRecipe) {
      if (matchedRecipe.inStock === false) {
        const text = `😔 Sorry, **${matchedRecipe.title}** is currently out of stock. Would you like to try our **${this.getAlternativeRecipe(matchedRecipe)?.title || 'Dal Fry'}** instead?`;
        this.addAssistantMessage(text, { type: 'INFO', recipe: matchedRecipe }, shouldSpeak);
        return;
      }

      const success = this.cartService.addItemsToCart(matchedRecipe, quantity);
      const newTotal = this.cartService.getCurrentTotal();
      const qtyText = quantity > 1 ? `${quantity} plates of ` : '';
      
      const text = `✅ **Added to Cart!**\n\n` +
        `Added **${qtyText}${matchedRecipe.title}** (₹${(matchedRecipe.price || 0) * quantity}) to your order.\n` +
        `Current Total: **₹${newTotal}**\n\n` +
        `Would you like to add anything else or say *"Checkout"*?`;

      this.addAssistantMessage(text, { type: 'ADD', recipe: matchedRecipe, quantity, total: newTotal }, shouldSpeak);
      return;
    }

    // FALLBACK / HELPFUL COPILOT GUIDANCE
    const text = `🤔 I didn't quite catch the specific dish in: *"${rawText}"*.\n\n` +
      `Here are some helpful things you can say or type:\n` +
      `• *"Add 2 South Indian Poha"*\n` +
      `• *"Order 1 Dal Fry"*\n` +
      `• *"Show my cart"*\n` +
      `• *"Apply coupon FOODY20"*\n` +
      `• *"Dishes under ₹150"*\n` +
      `• *"Checkout"*`;

    this.addAssistantMessage(text, { type: 'HELP' }, shouldSpeak);
  }

  // ─── Inline Cart Adjustments From Chat ──────────────────────────────────
  public increaseItemQuantity(recipe: Recipe) {
    this.cartService.addItemsToCart(recipe, 1);
    const newTotal = this.cartService.getCurrentTotal();
    const text = `➕ Added another **${recipe.title}**. New cart total: **₹${newTotal}**.`;
    this.addAssistantMessage(text, { type: 'ADD', recipe, quantity: 1, total: newTotal }, true);
  }

  public decreaseItemQuantity(recipe: Recipe) {
    const items = this.cartService.getItems();
    const recipeId = Number(recipe.id || recipe._id || 0);
    const found = items.find(i => (i.recipe.id || i.recipe._id) == (recipe.id || recipe._id));
    if (found) {
      if (found.quantity <= 1) {
        this.cartService.removeFromCart(recipeId);
        const text = `🗑️ Removed **${recipe.title}** from your cart.`;
        this.addAssistantMessage(text, { type: 'REMOVE', recipe, total: this.cartService.getCurrentTotal() }, true);
      } else {
        this.cartService.updateQuantity(recipeId, found.quantity - 1);
        const text = `➖ Reduced **${recipe.title}** to ${found.quantity - 1}. New cart total: **₹${this.cartService.getCurrentTotal()}**.`;
        this.addAssistantMessage(text, { type: 'ADD', recipe, quantity: found.quantity - 1, total: this.cartService.getCurrentTotal() }, true);
      }
    }
  }

  // ─── Helper Functions ───────────────────────────────────────────────────
  private addAssistantMessage(text: string, action?: ChatMessage['action'], shouldSpeak = true) {
    const msg: ChatMessage = {
      id: 'ast-' + Date.now(),
      sender: 'assistant',
      text,
      timestamp: new Date(),
      action
    };
    this.messages$.next([...this.messages$.value, msg]);

    if (shouldSpeak && !this.isMuted$.value) {
      // Speak plain text summary
      const spoken = text
        .replace(/\*\*/g, '')
        .replace(/^[•\s\d.]+/gm, '')
        .replace(/₹/g, 'Rupees ')
        .replace(/[*_#➜●○⚠️🎉🔥⚡🛵🍔🍕✨🏷️⭐]/g, '')
        .replace(/\n\n+/g, '. ')
        .trim();
      this.speak(spoken);
    }
  }

  public speak(cleanText: string) {
    if (!this.isBrowser || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isMuted$.value) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = this.language$.value;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find(v => 
          (this.language$.value === 'hi-IN' && (v.lang.includes('hi') || v.name.includes('Hindi'))) ||
          (this.language$.value === 'en-IN' && (v.lang.includes('en-IN') || v.name.includes('India')))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => { this.zone.run(() => { this.isSpeaking$.next(true); }); };
      utterance.onend = () => { this.zone.run(() => { this.isSpeaking$.next(false); }); };
      utterance.onerror = () => { this.zone.run(() => { this.isSpeaking$.next(false); }); };

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public stopSpeaking() {
    if (this.isBrowser && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking$.next(false);
    }
  }

  // ─── Auto-Correction & Levenshtein Distance ──────────────────────────────
  private autoCorrectFoodWords(query: string): string {
    const tokens = query.split(/\s+/);
    const correctedTokens = tokens.map(token => {
      // 1. Direct synonym match
      if (this.foodSynonyms[token]) {
        return this.foodSynonyms[token];
      }

      // 2. Fuzzy match against dictionary keys
      for (const [misspelled, correct] of Object.entries(this.foodSynonyms)) {
        if (this.similarity(token, misspelled) >= 0.72) {
          return correct;
        }
      }

      return token;
    });

    return correctedTokens.join(' ');
  }

  private similarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    return (longerLength - this.levenshtein(longer, shorter)) / longerLength;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  private matchesAny(text: string, patterns: string[]): boolean {
    return patterns.some(p => text.includes(p));
  }

  private extractQuantity(text: string): number {
    const digitMatch = text.match(/\b([1-9]|10)\b/);
    if (digitMatch) return parseInt(digitMatch[1], 10);

    const words: Record<string, number> = {
      one: 1, a: 1, an: 1, single: 1, ek: 1, aik: 1,
      two: 2, double: 2, do: 2, doye: 2,
      three: 3, teen: 3, tin: 3,
      four: 4, chaar: 4, char: 4,
      five: 5, paanch: 5, panch: 5,
      six: 6, chhah: 6, chheh: 6,
      seven: 7, saat: 7,
      eight: 8, aath: 8,
      nine: 9, nau: 9,
      ten: 10, das: 10
    };

    for (const t of text.split(/\s+/)) {
      if (words[t] !== undefined) return words[t];
    }

    return 1;
  }

  private extractCouponCode(text: string): string {
    const codeMatch = text.match(/\b(foody\d+|freedel|[a-z0-9]{5,8})\b/i);
    return codeMatch ? codeMatch[1].toUpperCase() : 'FOODY20';
  }

  private findMatchingRecipe(query: string): Recipe | null {
    if (!this.recipesCache || this.recipesCache.length === 0) return null;

    const clean = query
      .replace(/\b(add|order|please|kardo|kar do|plate|plates|portion|portions|bowl|bowls|mangwao|chahiye|de do|dena|lao|pack|packet|ek|do|teen|chaar|char|one|two|three|four)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return null;

    let bestRecipe: Recipe | null = null;
    let highestScore = 0;

    for (const recipe of this.recipesCache) {
      const title = recipe.title.toLowerCase();
      const slug = recipe.slug ? recipe.slug.toLowerCase().replace(/-/g, ' ') : '';
      let score = 0;

      // 1. Direct match
      if (title === clean || slug === clean) {
        score += 100;
      } else if (title.includes(clean) || clean.includes(title)) {
        score += 80;
      } else {
        // 2. Token overlap & fuzzy token similarity
        const cleanTokens = clean.split(' ').filter(w => w.length > 2);
        const titleTokens = title.split(/[\s()]+/).filter(w => w.length > 2);

        let matchCount = 0;
        for (const ct of cleanTokens) {
          for (const tt of titleTokens) {
            if (ct === tt || tt.includes(ct) || ct.includes(tt)) {
              matchCount += 1.0;
              break;
            } else if (this.similarity(ct, tt) >= 0.70) {
              matchCount += 0.85; // Auto-corrected token match
              break;
            }
          }
        }

        if (matchCount > 0) {
          score += (matchCount / Math.max(cleanTokens.length, titleTokens.length)) * 75;
        }
      }

      if (score > highestScore && score >= 28) {
        highestScore = score;
        bestRecipe = recipe;
      }
    }

    return bestRecipe;
  }

  private findMatchingCartItem(query: string, items: any[]): any | null {
    if (!items || items.length === 0) return null;
    const clean = query
      .replace(/\b(remove|delete|hatao|hata do|cancel|from cart|ko|se|nikaal do)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    for (const item of items) {
      const title = item.recipe.title.toLowerCase();
      if (title.includes(clean) || clean.includes(title) || this.similarity(title, clean) >= 0.60) {
        return item;
      }
    }
    return null;
  }

  private getAlternativeRecipe(recipe: Recipe): Recipe | null {
    return this.recipesCache.find(r => r.category === recipe.category && r.inStock !== false && r.id !== recipe.id) || null;
  }
}
