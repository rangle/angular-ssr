import {
  Injectable,
  Inject,
  OnDestroy
} from '@angular/core';

const domino = require('domino');

import {TemplateDocument, RequestUri} from './tokens';

@Injectable()
export class DocumentContainer implements OnDestroy {
  private windowRef: Window;

  constructor(
    @Inject(TemplateDocument) templateDocument: string,
    @Inject(RequestUri) requestUri: string
  ) {
    this.windowRef = domino.createWindow(templateDocument, requestUri);
  }

  get window(): Window {
    if (this.windowRef == null) {
      throw new Error('No window container has been initialized');
    }
    return this.windowRef;
  }

  get document(): Document {
    if (this.windowRef == null) {
      throw new Error('No DOM has been initialized');
    }
    return this.windowRef.document;
  }

  complete() {
    this.document.close();
  }

  ngOnDestroy() {
    this.complete();

    this.window.releaseEvents();

    this.windowRef = null;
  }
}