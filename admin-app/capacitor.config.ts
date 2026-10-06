import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodybhai.admin',
  appName: 'FoodyBhai Admin',
  webDir: 'dist/admin-app/browser',
  server: {
    cleartext: true,
    androidScheme: 'http',
    hostname: 'localhost'
  }
};

export default config;
