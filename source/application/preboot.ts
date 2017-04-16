export type PrebootApplicationRoot = {appRoot: string | Array<string>};

export type PrebootSeparateRoots = {serverClientRoot: Array<{clientSelector: string, serverSelector: string}>};

export type PrebootBaseOptions = {
  eventSelectors?: Array<EventSelector>;
  buffer?: boolean;
  uglify?: boolean;
  noInlineCache?: boolean;
};

export type PrebootConfiguration = (PrebootApplicationRoot | PrebootSeparateRoots) & PrebootBaseOptions;

// NOTE(bond): This is an internal interface that we use to query the configuration. For APIs that
// accept a configuration object from an API consumer, those should use {@link PrebootConfiguration}
// as it has the proper union rules about requiring either appRoot or serverClientRoot.
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
