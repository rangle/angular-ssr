describe('Browser types', () => {
  it('exposes events for use in decorators', () => {
    expect(typeof Event).toBe('function');
    expect(typeof Event).toBe('function');
    expect(typeof AnimationEvent).toBe('function');
    expect(typeof AudioProcessingEvent).toBe('function');
    expect(typeof BeforeUnloadEvent).toBe('function');
    expect(typeof ClipboardEvent).toBe('function');
    expect(typeof CompositionEvent).toBe('function');
    expect(typeof CustomEvent).toBe('function');
    expect(typeof DeviceLightEvent).toBe('function');
    expect(typeof DeviceMotionEvent).toBe('function');
    expect(typeof DeviceOrientationEvent).toBe('function');
    expect(typeof DragEvent).toBe('function');
    expect(typeof Event).toBe('function');
    expect(typeof FocusEvent).toBe('function');
    expect(typeof GamepadEvent).toBe('function');
    expect(typeof KeyboardEvent).toBe('function');
    expect(typeof MessageEvent).toBe('function');
    expect(typeof MouseEvent).toBe('function');
    expect(typeof MutationEvent).toBe('function');
    expect(typeof OfflineAudioCompletionEvent).toBe('function');
    expect(typeof PageTransitionEvent).toBe('function');
    expect(typeof PointerEvent).toBe('function');
    expect(typeof PopStateEvent).toBe('function');
    expect(typeof ProgressEvent).toBe('function');
    expect(typeof SVGZoomEvent).toBe('function');
    expect(typeof ServiceWorkerMessageEvent).toBe('function');
    expect(typeof SpeechSynthesisEvent).toBe('function');
    expect(typeof StorageEvent).toBe('function');
    expect(typeof TouchEvent).toBe('function');
    expect(typeof TransitionEvent).toBe('function');
    expect(typeof UIEvent).toBe('function');
    expect(typeof WheelEvent).toBe('function');
  });

  it('exposes Selection', () => expect(typeof Selection).toBe('function'));

  it('exposes Range', () => expect(typeof Range).toBe('function'));

  it('exposes Reflect', () => expect(typeof Reflect).toBe('object'));

  it('exposes MutationObserver', () => expect(typeof MutationObserver).toBe('function'));
});
