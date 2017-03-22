// In general, it is better if your application supplies complete absolute URIs when doing
// things like demand rendering and so forth. But in the event that you just pass relative
// URIs instead (because that is what you get by default from express), then the library
// will resolve it into an absolute URI by joining it with the baseUri value. But the reason
// it is better to use absolute URLs is that your application may be calling some services
// based on window.location and if so, localhost may not be what you want.
export const baseUri = 'http://localhost/';