import {Injectable, OnDestroy} from '@angular/core';

import {DocumentContainer} from '../document';

import {SharedStyles} from './shared';

@Injectable()
export class DocumentStyles implements OnDestroy {
  private host = new Set<Node>();

  private styleElements = new Set<Element>();

  private unsubscribe: () => void;

  constructor(private sharedStyles: SharedStyles, private container: DocumentContainer) {
    this.host.add(container.document.head);

    this.unsubscribe = sharedStyles.bind(
      added => {
        this.host.forEach(hostNode => this.addToContainer(Array.from(added), hostNode));
      });
  }

  addStyles(styles: Array<string>) {
    this.sharedStyles.add(styles);
  }

  addHost(hostNode: Node): void {
    this.addToContainer(this.sharedStyles.current, hostNode);

    this.host.add(hostNode);
  }

  removeHost(hostNode: Node): void {
    this.host.delete(hostNode);
  }

  ngOnDestroy() {
    this.styleElements.forEach(styleNode => styleNode.remove());

    this.unsubscribe();
  }

  private addToContainer(styles: Array<string>, host: Node): void {
    for (const style of styles) {
      const element = this.container.document.createElement('style');
      element.textContent = style;

      host.appendChild(element);

      this.styleElements.add(element);
    }
  }
}