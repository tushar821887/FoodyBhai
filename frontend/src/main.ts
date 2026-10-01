import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

window.onerror = function(message, source, lineno, colno, error) {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '200px';
  errDiv.style.left = '50px';
  errDiv.style.right = '50px';
  errDiv.style.padding = '20px';
  errDiv.style.background = 'red';
  errDiv.style.color = 'white';
  errDiv.style.zIndex = '999999';
  errDiv.style.fontSize = '18px';
  errDiv.innerHTML = 'FATAL ERROR: ' + message + '<br>' + (error ? error.stack : '');
  document.body.appendChild(errDiv);
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    const errDiv = document.createElement('div');
    errDiv.style.position = 'fixed';
    errDiv.style.top = '200px';
    errDiv.style.left = '50px';
    errDiv.style.right = '50px';
    errDiv.style.padding = '20px';
    errDiv.style.background = 'red';
    errDiv.style.color = 'white';
    errDiv.style.zIndex = '999999';
    errDiv.style.fontSize = '18px';
    errDiv.innerHTML = 'BOOTSTRAP ERROR: ' + err.message + '<br>' + err.stack;
    document.body.appendChild(errDiv);
    console.error(err);
  });
