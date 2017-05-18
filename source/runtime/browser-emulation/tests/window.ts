describe('window', () => {
  it('is defined in the context of ng application execution', async () => {
    expect(window).not.toBeNull();
  });

  it('provides polyfills for browser functions', async () => {
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
    expect(typeof window.clearImmediate).toBe('function');
    expect(typeof window.requestAnimationFrame).toBe('function');
    expect(typeof window.cancelAnimationFrame).toBe('function');
  });

  it('blur', async () => {
    expect(() => window.blur()).not.toThrow();
  });

  it('focus', async () => {
    expect(() => window.focus()).not.toThrow();
  });

  it('getSelection', async () => {
    let selection: Selection;
    expect(() => selection = window.getSelection()).not.toThrow();
    expect(selection).not.toBeNull();
    expect(selection.anchorNode).toBeNull();
    expect(selection.baseNode).toBeNull();
    expect(() => selection.removeAllRanges()).not.toThrow();
  });

  it('alert', async () => {
    expect(typeof alert).toBe('function');
    expect(() => window.alert('Alert')).not.toThrow();
  });

  it('confirm', async () => {
    expect(typeof confirm).toBe('function');
    expect(window.confirm('Yes?')).toBe(true);
  });

  it('prompt', () => {
    expect(typeof prompt).toBe('function');
    expect(window.prompt('Hello')).toBe('');
  });

  it('print', () => {
    expect(typeof print).toBe('function');
    expect(() => window.print()).not.toThrow();
  });

  describe('Base64 implementation', () => {
    it('has working atoa', () => {
      expect(atob('hello there')).toBe('ée¢Ø^­');
    });

    it('has working btoa', () => {
      expect(btoa('Hello there')).toBe('SGVsbG8gdGhlcmU=');
    });
  });

  describe('history', () => {
    it('is defined in the context of ng application execution', async () => {
      expect(window.history).not.toBeNull();
      expect(window.history.state).toBeUndefined();
    });
  });

  describe('MutationObserver', () => {
    it('provides a constructor implementation', async () => {
      expect(() => new MutationObserver(() => {})).not.toThrow();
    });
  })
});