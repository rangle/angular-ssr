import {Trie} from '../trie';

describe('Trie', () => {
  type TestVariant = {a: number, b: number};

  type TestValue = {hello: string};

  it('can insert a variant with a value', () => {
    const trie = new Trie<TestVariant, TestValue>();
    expect(() => trie.insert({a: 0, b: 1}, {hello: 'world'})).not.toThrow();
  });

  it('can query the trie using different key instances', () => {
    const trie = new Trie<TestVariant, TestValue>();

    const v1: TestVariant = {a: 0, b: 10};
    const v2: TestVariant = {b: -1, a: 5};

    expect(() => trie.insert(Object.assign({}, v1), {hello: 'Chris'})).not.toThrow();
    expect(() => trie.insert(Object.assign({}, v2), {hello: 'Bond'})).not.toThrow();

    const q1 = trie.query(v1);
    expect(q1).not.toBeNull();
    expect(q1.hello).toBe('Chris');

    const q2 = trie.query(v2);
    expect(q2).not.toBeNull();
    expect(q2.hello).toBe('Bond');
  });

  it('key values with different property order should compare equal', () => {
    const trie = new Trie<TestVariant, TestValue>();

    const v1: TestVariant = {a: 0, b: 0};
    const v2: TestVariant = {b: 0, a: 0};

    expect(() => trie.insert(v1, {hello: 'Chris'})).not.toThrow();

    const result = trie.query(v2);
    expect(result).not.toBeNull();
    expect(result.hello).toBe('Chris');
  });

  it('inserting variants with different keys should throw an exception', () => {
    const trie = new Trie<any, string>();
    expect(() => trie.insert({a: 1}, 'hello')).not.toThrow();
    expect(() => trie.insert({a: 1, b: 2}, 'hello')).toThrow();
  });

  it('inserting and querying variants with different keys should throw an exception', () => {
    const trie = new Trie<any, string>();
    expect(() => trie.insert({a: 1}, 'hello')).not.toThrow();
    expect(() => trie.query({a: 1, b: 2})).toThrow();
  });
});