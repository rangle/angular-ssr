import {
  Inject,
  Injectable,
  OnDestroy
} from '@angular/core';

import {
  LocationChangeListener,
  PlatformLocation,
} from '@angular/common';

import url = require('url');

import {DocumentContainer, RequestUri} from '../document';

import {NotSupportedException} from '../../exception';

@Injectable()
export class LocationImpl implements Location, PlatformLocation, OnDestroy {
  initializationPromise: Promise<void>;

  private readonly destruction = new Array<() => void>();

  private initialized: () => void;

  constructor(
    @Inject(RequestUri) private requestUri: string,
    private documentContainer: DocumentContainer
  ) {
    this.documentContainer.document.location.assign(requestUri);

    this.initializationPromise = new Promise<void>(resolve => this.initialized = () => resolve());
  }

  initializationComplete() {
    this.initialized();
  }

  assign(uri: string) {
    throw new NotSupportedException();
  }

  replace(uri: string) {
    throw new NotSupportedException();
  }

  reload() {
    throw new NotSupportedException();
  }

  get href(): string {
    return this.requestUri;
  }

  get host(): string {
    return this.parsed(u => u.host);
  }

  get hostname(): string {
    return this.parsed(u => u.hostname);
  }

  get origin(): string {
    return this.requestUri;
  }

  get port(): string {
    return this.parsed(u => u.port);
  }

  get protocol(): string {
    return this.parsed(u => u.protocol);
  }

  getBaseHrefFromDOM(): string {
    const element = this.documentContainer.document.querySelector('base');
    if (element == null) {
      return null;
    }
    return element.getAttribute('href') || '/';
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

  private parsed<T>(fn: (uri: url.Url) => T): T {
    try {
      return fn(url.parse(this.href));
    }
    catch (exception) {
      return null;
    }
  }
}