const fs = require('fs');

const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/private pollInterval: any;/, `private pollInterval: any;
  private lastPendingCount = -1;`);

content = content.replace(/fetchOrders\(\) \{[\s\S]*?\}\);\n  \}/, `fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        const pendingOrders = data.filter(o => o.status === 'pending').length;
        if (this.lastPendingCount !== -1 && pendingOrders > this.lastPendingCount) {
          this.playNotificationSound();
        }
        this.lastPendingCount = pendingOrders;
        
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }

  playNotificationSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const playBeep = (time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.3);
        
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.3);
      };
      
      playBeep(0);
      playBeep(0.4);
    } catch(e) {
      console.log('Audio not supported', e);
    }
  }`);

fs.writeFileSync(path, content);
