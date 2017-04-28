import url = require('url');

import {ApplicationTestContext, createApplicationTestContext} from '../../../test/fixtures';

describe('location', () => {
  let context: ApplicationTestContext;

  const parsedUri = url.parse('http://localhost/test#/');

  beforeAll(async () => {
    context = await createApplicationTestContext('http://localhost/test#/');
  });

  afterAll(() => context.dispose());

  it('is defined in the context of ng application execution', () => {
    return context.run(async () => {
      expect(location).not.toBeNull();
    });
  })

  it('describes the URI from the request', () => {
    return context.run(async () => {
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