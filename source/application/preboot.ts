export type PrebootApplicationRoot = {appRoot: string | Array<string>};

export type PrebootSeparateRoots = {serverClientRoot: Array<{clientSelector: string, serverSelector: string}>};

export type PrebootBaseOptions = {
  eventSelectors?: Array<EventSelector>;
  buffer?: boolean;
  uglify?: boolean;
  noInlineCache?: boolean;
};

export type PrebootConfiguration = (PrebootApplicationRoot | PrebootSeparateRoots) & PrebootBaseOptions;

export interface Preboot extends PrebootApplicationRoot, PrebootSeparateRoots, PrebootBaseOptions {}

export interface EventSelector {
  selector: string;
  events: Array<string>;
  keyCodes?: Array<number>;
  preventDefault?: boolean;
  freeze?: boolean;
  action?: (node: Node, event: Event) => void;
  noReplay?: boolean;
}
