import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodybhai.app',
  appName: 'Foody Bhai',
  webDir: 'dist/foody-bhai/browser',
  server: {
    cleartext: true,
    androidScheme: 'http',
    hostname: 'localhost'
  }
};

export default config;
