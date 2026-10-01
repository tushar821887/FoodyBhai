import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any) {
    if (typeof document !== 'undefined') {
      const errDiv = document.createElement('div');
      errDiv.style.position = 'fixed';
      errDiv.style.top = '100px';
      errDiv.style.left = '10px';
      errDiv.style.right = '10px';
      errDiv.style.padding = '20px';
      errDiv.style.background = 'rgba(255, 0, 0, 0.9)';
      errDiv.style.color = 'white';
      errDiv.style.zIndex = '999999';
      errDiv.style.maxHeight = '80vh';
      errDiv.style.overflow = 'auto';
      errDiv.innerHTML = '<h2>Angular Error</h2><pre>' + (error.stack || error.message || error) + '</pre>';
      document.body.appendChild(errDiv);
    }
    console.error('GlobalErrorHandler:', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ],
};
