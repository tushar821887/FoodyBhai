with open("src/app/services/cart.service.ts", "r") as f:
    content = f.read()

import re

# Add BehaviorSubjects and Observables
new_observables = """
  public totalPrice$ = this.items$.pipe(
    map(items => items.reduce((total, item) => total + ((item.recipe.price || 0) * item.quantity), 0))
  );

  private couponSubject = new BehaviorSubject<string>('');
  public coupon$ = this.couponSubject.asObservable();

  public discount$ = this.totalPrice$.pipe(
    map(total => this.couponSubject.value.toUpperCase() === 'FOODY20' ? Math.round(total * 0.2) : 0)
  );

  public finalPrice$ = this.totalPrice$.pipe(
    map(total => {
      const discount = this.couponSubject.value.toUpperCase() === 'FOODY20' ? Math.round(total * 0.2) : 0;
      return total - discount;
    })
  );
"""

content = re.sub(r'  public totalPrice\$ = this\.items\$\.pipe\(.*?\);\n', new_observables, content, flags=re.DOTALL)

# Add applyCoupon method
methods = """  applyCoupon(code: string): boolean {
    if (code.toUpperCase() === 'FOODY20') {
      this.couponSubject.next(code);
      this.itemsSubject.next([...this.itemsSubject.value]); // Trigger recalculation
      return true;
    }
    return false;
  }
  
  removeCoupon() {
    this.couponSubject.next('');
    this.itemsSubject.next([...this.itemsSubject.value]);
  }

  clearCart() {"""
content = content.replace("  clearCart() {", methods)

# Update getWhatsAppLinkWithDetails
wa_link = """  getWhatsAppLinkWithDetails(name: string, phone: string, address: string): string {
    const items = this.itemsSubject.value;
    if (items.length === 0) return '';
    
    let text = `Hello Foody Bhai! I would like to place an order.\\n\\n`;
    text += `*Delivery Details:*\\n`;
    text += `Name: ${name}\\n`;
    text += `Phone: ${phone}\\n`;
    text += `Address: ${address}\\n\\n`;
    text += `*Order Items:*\\n`;
    
    let total = 0;
    items.forEach(item => {
      const itemTotal = (item.recipe.price || 0) * item.quantity;
      total += itemTotal;
      text += `- ${item.quantity}x ${item.recipe.title} (₹${itemTotal})\\n`;
    });
    
    const coupon = this.couponSubject.value.toUpperCase();
    if (coupon === 'FOODY20') {
        const discount = Math.round(total * 0.2);
        const finalTotal = total - discount;
        text += `\\nSubtotal: ₹${total}`;
        text += `\\nDiscount (FOODY20): -₹${discount}`;
        text += `\\n*Total to Pay: ₹${finalTotal}*`;
    } else {
        text += `\\n*Total to Pay: ₹${total}*`;
    }
    
    return `https://wa.me/918218870579?text=${encodeURIComponent(text)}`;
  }"""
content = re.sub(r'  getWhatsAppLinkWithDetails\(name: string, phone: string, address: string\): string \{.*\}\n\}', wa_link + '\n}', content, flags=re.DOTALL)

with open("src/app/services/cart.service.ts", "w") as f:
    f.write(content)
