import 'reflect-metadata';

import {Injectable, OnDestroy} from '@angular/core';

import {
  LocationChangeListener,
  PlatformLocation,
} from '@angular/common';

import {DocumentContainer} from '../document';

@Injectable()
export class LocationImpl implements PlatformLocation, OnDestroy {
  private destruction = new Array<() => void>();

  constructor(private documentContainer: DocumentContainer) {}

  getBaseHrefFromDOM(): string {
    const element = this.documentContainer.document.querySelector('base');
    if (element == null) {
      return null;
    }
    return element.getAttribute('href');
  }

  onPopState(fn: LocationChangeListener) {
    this.documentContainer.window.addEventListener('popstate', fn, false);

    this.destruction.push(() => this.documentContainer.window.removeEventListener('popstate', fn));
  }

  onHashChange(fn: LocationChangeListener) {
    this.documentContainer.window.addEventListener('hashchange', fn, false);

    this.destruction.push(() => this.documentContainer.window.removeEventListener('hashchange', fn));
  }

  get pathname(): string {
    return this.documentContainer.window.location.pathname;
  }

  get search(): string {
    return this.documentContainer.window.location.search;
  }

  get hash(): string {
    return this.documentContainer.window.location.hash;
  }

  replaceState(state, title: string, url: string) {
    this.documentContainer.window.location.hash = url;
  }

  pushState(state, title: string, url: string) {
    this.documentContainer.window.location.hash = url;
  }

  forward() {
    this.documentContainer.window.history.forward();
  }

  back() {
    this.documentContainer.window.history.back();
  }

  ngOnDestroy() {
    this.destruction.forEach(d => d());
  }
}