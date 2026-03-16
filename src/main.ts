import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

function loadGoogleMaps(apiKey: string): Promise<void> {
  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.async = true;
    script.defer = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${apiKey}` +
      `&loading=async` +
      `&v=quarterly` +
      `&libraries=marker`;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps could not be loaded'));

    document.head.appendChild(script);
  });
}

loadGoogleMaps(environment.googleMapsApiKey)
  .then(() => bootstrapApplication(App, appConfig))
  .catch((error) => console.error(error));
