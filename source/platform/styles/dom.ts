import {Injectable, OnDestroy} from '@angular/core';

import {SharedStylesImpl} from './base';

import {DomContext} from '../dom';

@Injectable()
export class DomSharedStylesImpl extends SharedStylesImpl implements OnDestroy {
  private _hostNodes = new Set<Node>();

  private _styleNodes = new Set<Node>();

  constructor(private domContext: DomContext) {
    super();

    this._hostNodes.add(domContext.document.head);
  }

  private _addStylesToHost(styles: Set<string>, host: Node): void {
    styles.forEach((style: string) => {
      const styleEl = this.domContext.document.createElement('style');
      styleEl.textContent = style;
      this._styleNodes.add(host.appendChild(styleEl));
    });
  }

  addHost(hostNode: Node): void {
    this._addStylesToHost(this._stylesSet, hostNode);
    this._hostNodes.add(hostNode);
  }

  removeHost(hostNode: Node): void { this._hostNodes.delete(hostNode); }

  onStylesAdded(additions: Set<string>): void {
    this._hostNodes.forEach(hostNode => this._addStylesToHost(additions, hostNode));
  }

  ngOnDestroy(): void {
    this._styleNodes.forEach(styleNode => {
      // this.domContext.document.remove(styleNode);
    });
  }
}