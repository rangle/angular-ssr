import {Injectable, Inject, OnDestroy} from '@angular/core/index';

import {PlatformException} from '../../exception';

import {TemplateDocument, RequestUri} from './tokens';

import {mapZoneToContainer, unmapZoneFromContainer} from './map';

const domino = require('domino');

@Injectable()
export class DocumentContainer implements OnDestroy {
  private windowRef: Window;

  constructor(
    @Inject(TemplateDocument) templateDocument: string,
    @Inject(RequestUri) requestUri: string,
  ) {
    this.windowRef = domino.createWindow(templateDocument, requestUri);

    mapZoneToContainer(this);
  }

  get window(): Window {
    return this.windowRef || (() => {
      throw new PlatformException('No window container has been initialized');
    })();
  }

  get document(): Document {
    if (this.windowRef == null) {
      throw new PlatformException('No DOM has been initialized');
    }
    return this.windowRef.document;
  }

  complete() {
    this.document.close();
  }

  ngOnDestroy() {
    unmapZoneFromContainer(this);

    this.complete();

    // This may seem pointless but we just want to release all references
    // to the node elements in this document so that they can be garbage
    // collected.
    if (this.document) {
      const child = () => this.document.body.firstChild;
      while (child()) {
        this.document.removeChild(child());
      }
    }

    this.windowRef = null;
  }
}