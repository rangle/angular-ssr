import {MemoryVariantCache} from '../memory-variant-cache';

describe('MemoryVariantCache', () => {
  type Variants = {foo: boolean, bar: number};

  it('can never contain more than the size provided in the constructor', async () => {
    const mockApplication = {renderUri: () => Promise.resolve({})};
    const cache = new MemoryVariantCache<Variants>(mockApplication as any, 1);
    await cache.get('http://localhost/1', {foo: true, bar: 0});
    await cache.get('http://localhost/2', {foo: true, bar: 1});
    expect(cache.has('http://localhost/1', {foo: true, bar: 0})).toBe(false);
  });

  it('can retrieve based on a pair of URI and variant values', async () => {
    const mockApplication = {renderUri: () => Promise.resolve({})};
    const cache = new MemoryVariantCache<Variants>(mockApplication as any, 3);
    await cache.get('http://localhost/1', {foo: true, bar: 0});
    await cache.get('http://localhost/2', {foo: false, bar: 2});
    await cache.get('http://localhost/3', {foo: false, bar: -1});

    mockApplication.renderUri = () => new Promise((resolve, reject) => reject(new Error('Should not be called')));

    await cache.get('http://localhost/2', {foo: false, bar: 2}); // not recreated, must be cached version
  });
});