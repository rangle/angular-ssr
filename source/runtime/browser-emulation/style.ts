const {impl: {CSSStyleDeclaration}} = require('domino');

const getMatchedCSSRules = () => {
  return {
    matches: false,
    media: undefined,
    length: 0,
    item: (index: number) => undefined,
    addListener(listener: MediaQueryListListener) {},
    removeListener(listener: MediaQueryListListener) {},
  }
};

const getComputedStyle = (element: HTMLElement) => {
  const style = new CSSStyleDeclaration(element);

  const baseStyles = {
    display: 'block',
    height: 'auto',
    width: 'auto',
    'font-style': 'normal',
    'font-weight': 'normal',
    'line-height': 'normal',
  };

  for (const key in baseStyles) {
    if (style[key] == null) {
      style[key] = baseStyles[key];
    }
  }

  return style;
};

const matchMedia = (queryString: string) => {
  return {
    matches: false,
    media: null,
    length: 0,
    item: (index: number) => undefined,
    addListener(listener: MediaQueryListListener) {},
    removeListener(listener: MediaQueryListListener) {},
  };
};

export const bindStyle = (target: () => Window) => [true, {getComputedStyle, getMatchedCSSRules, matchMedia}];
