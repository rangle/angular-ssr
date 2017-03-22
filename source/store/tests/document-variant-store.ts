import {DocumentVariantStore} from '../document-variant-store';

describe('DocumentVariantStore', () => {
  const mockApplication = {renderUri: () => Promise.resolve({a: 1})} as any;

  interface Variants {foo: boolean, bar: number};

  it('can never contain more than the size provided in the constructor', async () => {
    const cache = new DocumentVariantStore<Variants>(mockApplication, 1);
    await cache.load('http://localhost/1', {foo: true, bar: 0});
    await cache.load('http://localhost/2', {foo: true, bar: 1});
    expect(cache.size).toBe(1);
  });

  it('can retrieve based on a pair of URI and variant values', async () => {
    const cache = new DocumentVariantStore<Variants>(mockApplication, 3);
    await cache.load('http://localhost/1', {foo: true, bar: 0});
    await cache.load('http://localhost/2', {foo: false, bar: 2});
    await cache.load('http://localhost/3', {foo: false, bar: -1});
    expect(cache.size).toBe(3);

    mockApplication.renderUri = () => {throw new Error('Should not be called')};

    expect(await cache.load('http://localhost/2', {foo: false, bar: 2})).toEqual({a:1}); // not recreated, must be cached version
  });
});