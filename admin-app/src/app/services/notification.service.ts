import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Subject } from 'rxjs';

const AppLauncher = registerPlugin<any>('AppLauncher');
const OrderAlertPlugin = registerPlugin<any>('OrderAlertPlugin');

export interface AppNotification {
  id?: number;
  title: string;
  body: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private ringAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private ringIntervalTimer: any = null;
  private isRinging = false;
  private channelInitialized = false;

  public notificationAction$ = new Subject<any>();

  constructor() {
    this.initAudio();
    this.initNativeNotifications();
    this.setupGlobalUnlockListener();
  }

  private initAudio() {
    // 1. Initialize Web Audio API context for zero-network, 100% reliable synthesized order chimes
    try {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.warn('Web Audio Context initialization error:', e);
    }

    // 2. Initialize local audio element with offline asset and remote fallback
    try {
      this.ringAudio = new Audio('assets/sounds/order_alert.wav');
      this.ringAudio.loop = true;
      this.ringAudio.onerror = () => {
        console.warn('Local sound error, falling back to remote alert');
        if (this.ringAudio) {
          this.ringAudio.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
        }
      };
    } catch (e) {
      console.warn('Audio element initialization error:', e);
    }
  }

  private audioUnlocked = false;

  private setupGlobalUnlockListener() {
    if (typeof window === 'undefined') return;
    const unlockHandler = () => {
      this.unlockAudio();
      if (this.audioUnlocked) {
        window.removeEventListener('click', unlockHandler);
        window.removeEventListener('touchstart', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      }
    };
    window.addEventListener('click', unlockHandler, { once: true, passive: true });
    window.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
    window.addEventListener('keydown', unlockHandler, { once: true, passive: true });
  }

  private async initNativeNotifications() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Create high-priority notification channel with custom order_alert.wav sound
        await LocalNotifications.createChannel({
          id: 'foodybhai_order_alerts_v2',
          name: 'Food Orders & Fleet Alerts',
          description: 'High priority alert for new incoming orders and delivery assignments',
          importance: 5, // High priority (heads-up banner)
          visibility: 1, // Visible on lock screen
          sound: 'order_alert.wav',
          vibration: true,
          lights: true,
          lightColor: '#ff4757',
        });
        this.channelInitialized = true;

        LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
          console.log('Notification tapped by user:', notificationAction);
          this.stopRinging();
          this.bringAppToFront();
          this.notificationAction$.next(notificationAction.notification.extra);
        });
      } catch (err) {
        console.warn('Failed to initialize native notifications:', err);
      }
    }
  }

  /**
   * Attempts to bring MainActivity to the foreground and wake up the screen
   */
  public async configureBackgroundService(apiUrl: string) {
    if (Capacitor.isNativePlatform()) {
      try {
        await OrderAlertPlugin.configure({ apiUrl });
        await OrderAlertPlugin.startService();
      } catch (e) {
        console.warn('OrderAlertPlugin configure error:', e);
      }
    }
  }

  public async stopNativeAlarm() {
    if (Capacitor.isNativePlatform()) {
      try {
        await OrderAlertPlugin.stopAlarm();
      } catch (e) {
        console.warn('OrderAlertPlugin stopAlarm error:', e);
      }
    }
  }

  public async requestBatteryOptimization() {
    if (Capacitor.isNativePlatform()) {
      try {
        await OrderAlertPlugin.requestBatteryOptimization();
      } catch (e) {}
    }
  }

  public async requestOverlayPermission() {
    if (Capacitor.isNativePlatform()) {
      try {
        await OrderAlertPlugin.requestOverlayPermission();
      } catch (e) {}
    }
  }

  public async bringAppToFront() {
    if (Capacitor.isNativePlatform()) {
      try {
        await AppLauncher.bringToFront();
      } catch (e) {
        console.warn('AppLauncher.bringToFront not available:', e);
      }
    }
  }

  public async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (Capacitor.isNativePlatform()) {
      try {
        const check = await LocalNotifications.checkPermissions();
        if (check.display === 'granted') return 'granted';
        if (check.display === 'denied') return 'denied';
        return 'prompt';
      } catch {
        return 'prompt';
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied') return 'denied';
      return 'prompt';
    }
    return 'prompt';
  }

  public unlockAudio() {
    if (this.audioUnlocked) return;

    // 1. Resume AudioContext if suspended
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // 2. Unlock HTML5 Audio silently
    if (this.ringAudio) {
      try {
        this.ringAudio.volume = 0;
        const p = this.ringAudio.play();
        if (p !== undefined) {
          p.then(() => {
            if (!this.isRinging && this.ringAudio) {
              this.ringAudio.pause();
              this.ringAudio.volume = 1;
              this.ringAudio.currentTime = 0;
            }
            this.audioUnlocked = true;
          }).catch(() => {
            // Autoplay blocked until genuine user gesture
          });
        } else {
          this.audioUnlocked = true;
        }
      } catch (e) {
        this.audioUnlocked = true;
      }
    } else {
      this.audioUnlocked = true;
    }
  }

  public async requestPermission(): Promise<boolean> {
    this.unlockAudio();
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await LocalNotifications.requestPermissions();
        const granted = res.display === 'granted';
        if (granted) {
          await LocalNotifications.createChannel({
            id: 'foodybhai_order_alerts_v2',
            name: 'Food Orders & Fleet Alerts',
            description: 'High priority alert for new incoming orders and delivery assignments',
            importance: 5,
            visibility: 1,
            sound: 'order_alert.wav',
            vibration: true,
            lights: true,
            lightColor: '#ff4757',
          });
        }
        return granted;
      } catch {
        return false;
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        return res === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100000000) + 1;
  }

  /**
   * Plays a loud 2-tone harmonic order chime burst using Web Audio API (zero network, 100% reliable)
   */
  private playSynthesizedChime() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Primary Chime Tone: 880 Hz (A5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.85, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Secondary Chime Tone: 1174.66 Hz (D6)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.35);
      gain2.gain.setValueAtTime(0.95, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 0.95);
    } catch (e) {
      console.warn('Error playing synthesized chime burst:', e);
    }
  }

  /**
   * Sends an immediate system notification (Native + Web fallback) and opens/wakes app
   */
  public async sendNotification(notification: AppNotification): Promise<void> {
    const notifId = notification.id || (notification.data?._id ? this.hashString(notification.data._id) : Math.floor(Math.random() * 1000000));

    // 1. Wake screen and bring app to front on native Android
    this.bringAppToFront();

    // 2. Native Capacitor Notification (Android heads-up banner, lock screen, order_alert.wav sound)
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: notification.title,
              body: notification.body,
              channelId: 'foodybhai_order_alerts_v2',
              sound: 'order_alert.wav',
              autoCancel: true,
              extra: notification.data || {},
              ongoing: false,
            }
          ]
        });
      } catch (e) {
        console.error('Error posting native local notification:', e);
      }
    }

    // 3. Standard Browser Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/assets/icon/favicon.png',
          tag: String(notifId),
        });
      } catch (e) {}
    }

    // 4. Strong vibration feedback (SOS rhythm: 500ms, 200ms, 500ms, 200ms, 800ms)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([500, 200, 500, 200, 800]);
      } catch (e) {}
    }
  }

  /**
   * Continuous ringing audio for pending orders
   */
  public startRinging() {
    if (this.isRinging) {
      // Already ringing! Do not restart or interrupt current ring.
      return;
    }
    this.isRinging = true;

    // Wake and bring app to front if in background
    this.bringAppToFront();

    // 1. Resume AudioContext if suspended
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // 2. Play HTML5 ring audio loop (order_alert.wav)
    if (this.ringAudio) {
      try {
        this.ringAudio.currentTime = 0;
        this.ringAudio.volume = 1;
        this.ringAudio.loop = true;
        const p = this.ringAudio.play();
        if (p !== undefined) {
          p.catch((err) => {
            console.warn('HTML5 Audio play prevented, activating synthesized fallback:', err);
            this.startSynthesizerFallback();
          });
        }
      } catch (e) {
        this.startSynthesizerFallback();
      }
    } else {
      this.startSynthesizerFallback();
    }
  }

  private startSynthesizerFallback() {
    if (!this.isRinging) return;
    if (!this.ringIntervalTimer) {
      this.playSynthesizedChime();
      this.ringIntervalTimer = setInterval(() => {
        if (this.isRinging) {
          this.playSynthesizedChime();
        } else {
          clearInterval(this.ringIntervalTimer);
          this.ringIntervalTimer = null;
        }
      }, 2000);
    }
  }

  public stopRinging() {
    this.isRinging = false;
    this.stopNativeAlarm();
    if (this.ringIntervalTimer) {
      clearInterval(this.ringIntervalTimer);
      this.ringIntervalTimer = null;
    }
    if (this.ringAudio) {
      try {
        this.ringAudio.pause();
        this.ringAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  public isCurrentlyRinging(): boolean {
    return this.isRinging;
  }
}
