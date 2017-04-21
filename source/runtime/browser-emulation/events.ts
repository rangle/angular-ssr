function addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean) {
  return this().addEventListener(type, listener, useCapture);
}

export const bindEvents = (target: () => Window) => [false, {addEventListener: addEventListener.bind(target)}];