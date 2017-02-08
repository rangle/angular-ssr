import {Injectable} from '@angular/core';

import {
  LocationChangeListener,
  PlatformLocation,
} from '@angular/common';

@Injectable()
export class PlatformLocationImpl implements PlatformLocation {
  getBaseHrefFromDOM(): string {
    throw new Error('Not implemented');
  }

  onPopState(fn: LocationChangeListener): void {
    throw new Error('Not implemented');
  }

  onHashChange(fn: LocationChangeListener): void {
    throw new Error('Not implemented');
  }

  get pathname(): string {
    throw new Error('Not implemented');
  }

  get search(): string {
    throw new Error('Not implemented');
  }

  get hash(): string {
    throw new Error('Not implemented');
  }

  replaceState(state: any, title: string, url: string): void {
    throw new Error('Not implemented');
  }

  pushState(state: any, title: string, url: string): void {
    throw new Error('Not implemented');
  }

  forward(): void {
    throw new Error('Not implemented');
  }

  back(): void {
    throw new Error('Not implemented');
  }
}