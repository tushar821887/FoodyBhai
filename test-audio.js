const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/playNotificationSound\(\) \{[\s\S]*?\}\n  \}/, `playNotificationSound() {
    try {
      // Use HTML5 Audio for better browser compatibility
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Browser autoplay policy blocked the sound. Click anywhere on the dashboard to enable sounds.', error);
          // Fallback to oscillator if allowed
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          ctx.resume().then(() => {
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          });
        });
      }
    } catch(e) {
      console.error('Audio error', e);
    }
  }`);
fs.writeFileSync(path, content);
