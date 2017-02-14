import 'reflect-metadata';

import {Injectable} from '@angular/core';

import {
  LocationChangeListener,
  PlatformLocation,
} from '@angular/common';

import {DocumentContainer} from '../document';

@Injectable()
export class LocationImpl implements PlatformLocation {
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
  }

  onHashChange(fn: LocationChangeListener) {
    this.documentContainer.window.addEventListener('hashchange', fn, false);
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
}