import {DocumentStore} from '../document-store';

describe('DocumentStore', () => {
  it('can never contain more than the size provided in the constructor', async () => {
    const mockApplication = {renderUri: () => new Promise(resolve => resolve({}))};
    const cache = new DocumentStore(mockApplication as any, 1);

    await cache.load('http://localhost/1');
    await cache.load('http://localhost/2');
    expect(cache.size).toBe(1);

    cache.reset();
  });

  it('can reorder the items based on last access', async () => {
    const mockApplication = {renderUri: () => new Promise(resolve => resolve({}))};
    const cache = new DocumentStore(mockApplication as any, 3);

    await cache.load('http://localhost/1');
    await cache.load('http://localhost/2');
    await cache.load('http://localhost/3');
    expect(cache.size).toBe(3);

    await cache.load('http://localhost/1'); // move it to front
    await cache.load('http://localhost/4');
    expect(cache.size).toBe(3);

    mockApplication.renderUri = () => new Promise((resolve, reject) => reject(new Error('Should not be called')));

    await cache.load('http://localhost/1'); // must be cached instance

    cache.reset();
  });
});