import {DocumentVariantStore} from '../document-variant-store';

describe('DocumentVariantStore', () => {
  interface Variants {foo: boolean, bar: number};

  it('can never contain more than the size provided in the constructor', async () => {
    const mockApplication = {renderUri: () => Promise.resolve({})};
    const cache = new DocumentVariantStore<Variants>(mockApplication as any, 1);
    try {
      await cache.load('http://localhost/1', {foo: true, bar: 0});
      await cache.load('http://localhost/2', {foo: true, bar: 1});
      expect(cache.size).toBe(1);
    }
    finally {
      cache.reset();
    }
  });

  it('can retrieve based on a pair of URI and variant values', async () => {
    const mockApplication = {renderUri: () => Promise.resolve({})};
    const cache = new DocumentVariantStore<Variants>(mockApplication as any, 3);
    try {
      await cache.load('http://localhost/1', {foo: true, bar: 0});
      await cache.load('http://localhost/2', {foo: false, bar: 2});
      await cache.load('http://localhost/3', {foo: false, bar: -1});
      expect(cache.size).toBe(3);

      mockApplication.renderUri = () => new Promise((resolve, reject) => reject(new Error('Should not be called')));

      await cache.load('http://localhost/2', {foo: false, bar: 2}); // not recreated, must be cached version
    }
    finally {
      cache.reset();
    }
  });
});