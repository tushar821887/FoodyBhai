import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodybhai.admin',
  appName: 'FoodyBhai Admin',
  webDir: 'dist/admin-app/browser',
  server: {
    cleartext: true
  }
};

export default config;
