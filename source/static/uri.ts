export namespace ApplicationFallbackOptions {
  // NOTE(bond): In general, it is better if your application supplies complete absolute URIs when
  // doing things like demand rendering and so forth. But in the event that you just pass relative
  // URIs instead (because that is what you get by default from express), then the library will
  // resolve it into an absolute URI by joining it with the baseUri value. But the reason it is
  // better to use absolute URLs is that your application may be calling some services based on
  // window.location and if so, localhost may not be what you want. Regardless, this URI is still
  // used for things like booting an application to extract the router configuration from. In that
  // particular case it doesn't matter what the URI is because we are not rendering.
  export const fallbackUri = 'http://localhost/';

  // Locale to fall back on when none is specified with LOCALE_ID
  export const locale = 'en-US';
}