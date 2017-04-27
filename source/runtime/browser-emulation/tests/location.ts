import url = require('url');

import {runInsideApplication} from '../../../test/fixtures/module';

describe('location', () => {
  it('describes the URI from the request', () => {
    const parsedUri = url.parse('http://localhost/test#/');

    return runInsideApplication('http://localhost/test#/', () => {
      expect(window.location).not.toBeNull();
      expect(window.location.pathname).toBe(parsedUri.pathname);
      expect(window.location.hash).toBe(parsedUri.hash);
      expect(window.location.host).toBe(parsedUri.host);
      expect(window.location.hostname).toBe(parsedUri.hostname);
      expect(window.location.href).toBe(parsedUri.href);
      expect(window.location.origin).toBe('http://localhost');
      expect(window.location.protocol).toBe(parsedUri.protocol);
      expect(typeof window.location.assign).toBe('function');
      expect(typeof window.location.reload).toBe('function');
      expect(typeof window.location.replace).toBe('function');
    });
  });
});