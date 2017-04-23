import {runInsideApplication} from '../../../test/fixtures/module';

describe('window', () => {
  const uri = 'http://localhost/test-uri';

  it('is defined in the context of ng application execution', () => {
    return runInsideApplication(uri, () => {
      expect(window).not.toBeNull();
    })
  });

  it('provides polyfills for browser functions', () => {
    return runInsideApplication('http://localhost/', () => {
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
      expect(typeof window.requestAnimationFrame).toBe('function');
      expect(typeof window.cancelAnimationFrame).toBe('function');
    });
  });

  it('blur', () => {
    return runInsideApplication('http://localhost/', () => {
      expect(() => window.blur()).not.toThrow();
    });
  });

  it('focus', () => {
    return runInsideApplication('http://localhost/', () => {
      expect(() => window.focus()).not.toThrow();
    });
  });

  it('getSelection', () => {
    return runInsideApplication('http://localhost/', () => {
      let selection: Selection;
      expect(() => selection = window.getSelection()).not.toThrow();
      expect(selection).not.toBeNull();
      expect(selection.anchorNode).toBeNull();
      expect(selection.baseNode).toBeNull();
      expect(() => selection.removeAllRanges()).not.toThrow();
    });
  });

  it('alert / confirm / prompt / print', () => {
    return runInsideApplication('http://localhost/', () => {
      expect(typeof alert).toBe('function');
      expect(typeof confirm).toBe('function');
      expect(typeof print).toBe('function');
      expect(typeof prompt).toBe('function');
      expect(window.prompt('Hello')).toBe('');
      expect(window.confirm('Yes?')).toBe(true);
      expect(() => window.alert('Alert')).not.toThrow();
      expect(() => window.print()).not.toThrow();
    })
  });
});