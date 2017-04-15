import {ConsoleLog} from './console';

export interface Snapshot<V> {
  console: Array<ConsoleLog>;
  exceptions: Array<Error>;
  renderedDocument: string | undefined;
  variant?: V;
  applicationState?;
  uri: string;
}