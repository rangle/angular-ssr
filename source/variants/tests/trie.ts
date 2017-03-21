import {Trie} from '../trie';

describe('trie structure', () => {
  type TestVariant = {foo: number, bar: number, baz: number};

  type TestValue = {hello: string};

  it('can insert a variant with a value', () => {
    const trie = new Trie<TestVariant, TestValue>();

    const variant: TestVariant = {foo: 0, bar: 10, baz: 1};

    expect(() => trie.insert(variant, {hello: 'world'})).not.toThrow();
  });

  it('can query the trie using different key instances', () => {
    const trie = new Trie<TestVariant, TestValue>();

    const variant1: TestVariant = {foo: 0, bar: 10, baz: 1};
    const variant2: TestVariant = {foo: -10, bar: 10, baz: -1};

    expect(() => trie.insert(Object.assign({}, variant1), {hello: 'Chris'})).not.toThrow();
    expect(() => trie.insert(Object.assign({}, variant2), {hello: 'Bond'})).not.toThrow();

    const q1 = trie.query(variant1);
    expect(q1).not.toBeNull();
    expect(q1.hello).toBe('Chris');

    const q2 = trie.query(variant2);
    expect(q2).not.toBeNull();
    expect(q2.hello).toBe('Bond');
  });
});