import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Subject } from 'rxjs';

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
  private isRinging = false;
  private channelInitialized = false;

  public notificationAction$ = new Subject<any>();

  constructor() {
    this.initAudio();
    this.initNativeNotifications();
  }

  private initAudio() {
    try {
      this.ringAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      this.ringAudio.loop = true;
    } catch (e) {
      console.warn('Audio initialization error:', e);
    }
  }

  private async initNativeNotifications() {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.createChannel({
          id: 'foodybhai_orders',
          name: 'Food Orders & Fleet Alerts',
          description: 'Real-time alert for new orders and delivery assignments',
          importance: 5, // High priority (heads-up banner)
          visibility: 1, // Visible on lock screen
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#ff4757',
        });
        this.channelInitialized = true;

        LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
          console.log('Notification tapped by user:', notificationAction);
          this.stopRinging();
          this.notificationAction$.next(notificationAction.notification.extra);
        });
      } catch (err) {
        console.warn('Failed to initialize native notifications:', err);
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
    if (this.ringAudio) {
      try {
        this.ringAudio.volume = 0.01;
        const p = this.ringAudio.play();
        if (p !== undefined) {
          p.then(() => {
            setTimeout(() => {
              if (!this.isRinging && this.ringAudio) {
                this.ringAudio.pause();
                this.ringAudio.volume = 1;
                this.ringAudio.currentTime = 0;
              }
            }, 100);
          }).catch(() => {});
        }
      } catch (e) {}
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
            id: 'foodybhai_orders',
            name: 'Food Orders & Fleet Alerts',
            description: 'Real-time alert for new orders and delivery assignments',
            importance: 5,
            visibility: 1,
            sound: 'default',
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

  /**
   * Generates a numeric 32-bit ID from string (for LocalNotifications unique ID)
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100000000) + 1;
  }

  /**
   * Sends an immediate system notification (Native + Web fallback)
   */
  public async sendNotification(notification: AppNotification): Promise<void> {
    const notifId = notification.id || (notification.data?._id ? this.hashString(notification.data._id) : Math.floor(Math.random() * 1000000));

    // 1. Native Capacitor Notification (Android status bar, notification shade, heads-up)
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: notification.title,
              body: notification.body,
              channelId: 'foodybhai_orders',
              sound: 'default',
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

    // 2. Standard Browser Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/assets/icon/favicon.png',
          tag: String(notifId),
        });
      } catch (e) {}
    }

    // 3. Native Vibration feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([400, 200, 400, 200, 400]);
      } catch (e) {}
    }
  }

  /**
   * Continuous ringing audio for pending orders
   */
  public startRinging() {
    if (!this.ringAudio || this.isRinging) return;
    this.isRinging = true;
    const playPromise = this.ringAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play prevented (requires user interaction):', err);
        this.isRinging = false;
      });
    }
  }

  public stopRinging() {
    if (!this.ringAudio) return;
    this.isRinging = false;
    this.ringAudio.pause();
    this.ringAudio.currentTime = 0;
  }
}
