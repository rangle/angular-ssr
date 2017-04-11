import {Injectable, Inject, OnDestroy} from '@angular/core';

import {TemplateDocument, RequestUri} from './tokens';

import {bootWindow} from '../../runtime/dom';

const domino = require('domino');

@Injectable()
export class DocumentContainer implements OnDestroy {
  private windowRef: Window;

  constructor(
    @Inject(TemplateDocument) templateDocument: string,
    @Inject(RequestUri) requestUri: string,
  ) {
    // TODO(bond): Instead of creating a new window we need to find a way to clone bootWindow so that
    // we do not lose event handlers and such that were configured during initialization. Libraries
    // like bootstrap modify document as part of their initial execution instead of as part of a runtime
    // initialization process. (i.e., import 'bootstrap' will cause the DOM to change / listeners to be
    // added / etc). As to how we would merge bootWindow.document with templateDocument, I haven't
    // figured that out yet.
    this.windowRef = domino.createWindow(templateDocument, requestUri);

    this.cloneFrom(bootWindow.document);

    Object.defineProperties(this.windowRef, {navigator: {get: () => global['navigator']}});
  }

  get window(): Window {
    return this.windowRef;
  }

  get document(): Document {
    return this.windowRef.document;
  }

  complete() {
    this.document.close();
  }

  ngOnDestroy() {
    this.complete();
  }

  private cloneFrom(document: Document) {
    bootWindow.document.dispatchEvent(new Event('DOMContentLoaded'));

    if (document.title) {
      this.document.title = document.title;
    }

    for (const tag of ['head', 'body']) { // clone from boot window
      if (this.document[tag] == null) {
        this.document.appendChild(this.document.createElement(tag));
      }

      for (const node of Array.from<Element>(bootWindow.document[tag].childNodes)) {
        this.document[tag].appendChild(node.cloneNode(true));
      }
    }
  }
}