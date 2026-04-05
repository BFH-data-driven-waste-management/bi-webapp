import { registerLocaleData } from '@angular/common';
import localeDeCh from '@angular/common/locales/de-CH';
import { bootstrapApplication } from '@angular/platform-browser';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

registerLocaleData(localeDeCh);

async function loadGoogleMaps(apiKey: string): Promise<void> {
  setOptions({
    key: apiKey,
    v: 'quarterly',
  });

  await Promise.all([importLibrary('maps'), importLibrary('marker')]);
}

loadGoogleMaps(environment.googleMapsApiKey)
  .then(() => bootstrapApplication(App, appConfig))
  .catch((error) => console.error(error));
