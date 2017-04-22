import {LOCALE_ID} from '@angular/core';

import {runInsideApplication} from './../../../test/fixtures/module';

import {FallbackOptions} from '../../../static';

import url = require('url');

describe('Browser execution environment', () => {
  const uri = 'http://localhost/test-uri';

  const parsedUri = url.parse(uri);

  it('window', () => {
    it('exists and is non-null', () => {
      return runInsideApplication(uri, () => {
        expect(window).not.toBeNull();
      })
    });

    it('provides polyfills for common browser functions', () => {
      expect(typeof window.addEventListener).toBe('function');
      expect(typeof window.alert).toBe('function');
      expect(typeof window.clearImmediate).not.toBe('function');
      expect(typeof window.close).toBe('function');
      expect(typeof window.confirm).toBe('function');
      expect(typeof window.dispatchEvent).toBe('function');
      expect(typeof window.fetch).toBe('function');
      expect(typeof window.focus).toBe('function');
      expect(typeof window.getSelection).toBe('function');
      expect(typeof window.open).toBe('function');
      expect(typeof window.prompt).toBe('function');
      expect(typeof window.stop).toBe('function');
      expect(typeof window.setImmediate).toBe('function');
    });

    it('implements navigator', () => {
      return runInsideApplication(uri, moduleRef => {
        expect(window.navigator).not.toBeNull();
        expect(window.navigator.language).toBe(FallbackOptions.locale);
      });
    });

    it('implements history', () => {
      return runInsideApplication(uri, () => {
        expect(window.history).not.toBeNull();
      });
    });

    it('implements location', () => {
      return runInsideApplication(uri, () => {
        expect(window.location).not.toBeNull();
        expect(window.location.pathname).toBe(parsedUri.pathname);
        expect(window.location.hash).toBe(parsedUri.hash);
        expect(window.location.host).toBe(parsedUri.host);
        expect(window.location.hostname).toBe(parsedUri.hostname);
        expect(window.location.href).toBe(parsedUri.href);
        expect(window.location.origin).toBe(uri);
        expect(window.location.port).toBe(parsedUri.port);
        expect(window.location.protocol).toBe(parsedUri.protocol);
        expect(typeof window.location.assign).toBe('function');
        expect(typeof window.location.reload).toBe('function');
        expect(typeof window.location.replace).toBe('function');
      });
    });

    it('implements navigator and uses LOCALE_ID injection for selected language', () => {
      return runInsideApplication(uri, () => {
        expect(navigator).not.toBeNull();
        expect(navigator.language).toBe('fr-FR');
        expect(navigator.cookieEnabled).toBe(false);
        expect(navigator.userAgent).toBe('Chrome');
      },
      [{provide: LOCALE_ID, useValue: 'fr-FR'}]);
    });

    it('implements animation functions', () => {
      return runInsideApplication(uri, () => {
        expect(typeof window.requestAnimationFrame).toBe('function');
        expect(typeof window.cancelAnimationFrame).toBe('function');

        return new Promise<void>(resolve => {
          requestAnimationFrame(() => resolve(void 0));
        });
      });
    })

    it('implements focus and selection', () => {
      return runInsideApplication(uri, () => {
        expect(() => window.blur()).not.toThrow();

        expect(() => window.focus()).not.toThrow();

        let selection: Selection;
        expect(() => selection = window.getSelection()).not.toThrow();

        expect(selection).not.toBeNull();
        expect(selection.anchorNode).not.toBeNull();
        expect(selection.anchorOffset).toBe(0);
        expect(selection.baseNode).not.toBeNull();
        expect(selection.baseOffset).toBe(0);
        expect(() => selection.removeAllRanges()).not.toThrow();
      });
    });

    it('does nothing on alert, confirm, prompt and print', () => {
      return runInsideApplication(uri, () => {
        expect(window.prompt('Hello')).toBe('');
        expect(window.confirm('Yes?')).toBe(true);
        expect(() => window.alert('Alert')).not.toThrow();
        expect(() => window.print()).not.toThrow();
      })
    });

    it('MutationObserver provides a constructor implementation', () => {
      return runInsideApplication(uri, () => {
        expect(() => new MutationObserver(() => {})).not.toThrow();
      });
    });

    it('exposes global functions that are bound to the correct zone-mapped windoww', () => {
      return runInsideApplication(uri, () => {
        return new Promise<void>(resolve => {
          Object.assign(window, {clearAnimationFrame: id => resolve()});

          cancelAnimationFrame(0);
        });
      });
    });

    it('exposes working btoa and atob', () => {
      return runInsideApplication(uri, () => {
        expect(atob('hello there')).toBe('ée¢Ø^');
        expect(btoa('Hello there')).toBe('SGVsbG8gdGhlcmU=');
      });
    });
  });
});