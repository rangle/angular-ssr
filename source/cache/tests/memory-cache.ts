import {MemoryCache} from '../memory-cache';

describe('MemoryCache', () => {
  it('can never contain more than the size provided in the constructor', async () => {
    const mockApplication = {renderUri: () => new Promise(resolve => resolve({}))};
    const cache = new MemoryCache(mockApplication as any, 1);

    await cache.load('http://localhost/1');
    await cache.load('http://localhost/2');
    expect(cache.has('http://localhost/1')).toBe(false);
  });

  it('can reorder the items based on last access', async () => {
    const mockApplication = {renderUri: () => new Promise(resolve => resolve({}))};
    const cache = new MemoryCache(mockApplication as any, 3);

    await cache.load('http://localhost/1');
    await cache.load('http://localhost/2');
    await cache.load('http://localhost/3');
    expect(cache.has('http://localhost/1')).toBe(true);
    expect(cache.has('http://localhost/2')).toBe(true);
    expect(cache.has('http://localhost/3')).toBe(true);

    await cache.load('http://localhost/1'); // move it to front
    await cache.load('http://localhost/4');
    expect(cache.has('http://localhost/2')).toBe(false);

    mockApplication.renderUri = () => new Promise((resolve, reject) => reject(new Error('Should not be called')));

    await cache.load('http://localhost/1'); // must be cached instance
  });
});