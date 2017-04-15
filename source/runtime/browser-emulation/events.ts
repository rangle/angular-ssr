function addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean) {
  return this().addEventListener(type, listener, useCapture);
}

export const bindEvents = targetWindow => ({addEventListener: addEventListener.bind(targetWindow)});