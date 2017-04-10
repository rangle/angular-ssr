import {Snapshot} from '../snapshot';

export interface Cache {
  has(uri: string, ...options): boolean;
  get(uri: string, ...options): Promise<Snapshot<any>>;
}