import {Snapshot} from '../snapshot';

export interface Cache {
  // Load the specified URI (again, options are specific to type of cache)
  load(uri: string, ...options): Promise<Snapshot<any>>;

  // Is the specified URI cached? (options are specific to the type of cache)
  has(uri: string, ...options): boolean;
}