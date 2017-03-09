import {Injectable, Inject, OnDestroy} from '@angular/core';

import {PlatformException} from '../../exception';

import {TemplateDocument, RequestUri} from './tokens';

const domino = require('domino');

@Injectable()
export class DocumentContainer implements OnDestroy {
  private windowRef: Window;

  constructor(
    @Inject(TemplateDocument) templateDocument: string,
    @Inject(RequestUri) requestUri: string,
  ) {
    this.windowRef = domino.createWindow(templateDocument, requestUri);
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
    this.complete();

    this.windowRef = null;
  }
}