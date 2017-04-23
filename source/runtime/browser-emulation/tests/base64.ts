describe('Base64 implementation', () => {
  it('has working atoa', () => {
    expect(atob('hello there')).toBe('ée¢Ø^­');
  });

  it('has working btoa', () => {
    expect(btoa('Hello there')).toBe('SGVsbG8gdGhlcmU=');
  });
});
