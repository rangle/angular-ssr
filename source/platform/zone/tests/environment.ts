import {NgModuleRef} from '@angular/core';

import url = require('url');

import {BasicInlineModule, templateDocument} from '../../../test/fixtures';
import {FallbackOptions} from '../../../static';
import {ServerPlatform} from '../../platform';
import {createJitPlatform} from '../../factory';
import {forkZone} from '../fork';

describe('Browser execution environment', () => {
  const uri = 'http://localhost/test-uri';

  const parsedUri = url.parse(uri);

  const runner = async (fn: (ref: NgModuleRef<any>) => void | Promise<void>): Promise<void> => {
    const platform: ServerPlatform = createJitPlatform() as ServerPlatform;
    try {
      return await forkZone(templateDocument, uri, async () => {
        const moduleRef = await platform.bootstrapModule(BasicInlineModule);
        try {
          return await Promise.resolve(fn(moduleRef));
        }
        finally {
          moduleRef.destroy();
        }
      });
    }
    finally {
      platform.destroy();
    }
  };

  it('window', () => {
    it('exists and is non-null', () => {
      return runner(() => {
        expect(window).not.toBeNull();
      })
    });

    it('provides polyfills for common browser functions', () => {
      expect(typeof window.alert).toBe('function');
      expect(typeof window.prompt).toBe('function');
      expect(typeof window.addEventListener).toBe('function');
      expect(typeof window.setImmediate).toBe('function');
      expect(typeof window.fetch).toBe('function');
      expect(typeof window.focus).toBe('function');
      expect(typeof window.getSelection).toBe('function');
      expect(typeof window.clearImmediate).not.toBe('function');
      expect(typeof window.dispatchEvent).toBe('function');
      expect(typeof window.stop).toBe('function');
      expect(typeof window.close).toBe('function');
      expect(typeof window.open).toBe('function');
    });

    it('implements navigator', () => {
      runner(moduleRef => {
        expect(window.navigator).not.toBeNull();
        expect(window.navigator.language).toBe(FallbackOptions.locale);
      });
    });

    it('implements history', () => {
      expect(window.history).not.toBeNull();
    });

    it('implements location', () => {
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
    })

    it('implements animation functions', () => {
      return runner(() => {
        expect(typeof window.requestAnimationFrame).toBe('function');
        expect(typeof window.cancelAnimationFrame).toBe('function');

        return new Promise<void>(resolve => {
          requestAnimationFrame(() => resolve(void 0));
        });
      });
    })

    it('implements getSelection', () => {
      return runner(() => {
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

    it('MutationObserver provides a constructor implementation', () => {
      return runner(() => {
        expect(() => new MutationObserver(() => {})).not.toThrow();
      });
    });

    it('exposes global functions that are bound to the correct zone-mapped windoww', () => {
      return runner(() => {
        return new Promise<void>(resolve => {
          Object.assign(window, {clearAnimationFrame: id => resolve()});

          cancelAnimationFrame(0);
        });
      });
    });
  });
});