import {Injectable, Inject, OnDestroy} from '@angular/core';

import {TemplateDocument, RequestUri} from './tokens';

import {bootWindow, createModernWindow} from '../../runtime/browser-emulation';

@Injectable()
export class DocumentContainer implements OnDestroy {
  private windowRef: Window;

  constructor(
    @Inject(TemplateDocument) templateDocument: string,
    @Inject(RequestUri) requestUri: string,
  ) {
    this.windowRef = createModernWindow(templateDocument, requestUri);

    this.cloneFrom(bootWindow.document);
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
    // NOTE(bond): This is a feeble attempt to avoid memory leaks by deleting all document elements
    // and therefore all event handlers associated with them as soon as we finish rendering. As to
    // whether or not this is going to have any positive effect or not, I do not know.
    this.document.documentElement.outerHTML = String();

    delete this.windowRef;
  }

  private cloneFrom(document: Document) {
    // NOTE(bond): Calling this more than once is probably not a smart idea and this code should
    // either be removed or refactored. Perhaps this event should just be dispatched on bootWindow
    // creation instead of when we are ready to clone from it when creating a new DOM.
    const event = new Event('DOMContentLoaded');
    event.stopImmediatePropagation();
    event.stopPropagation();

    bootWindow.document.dispatchEvent(event);

    if (document.title) {
      this.document.title = document.title;
    }

    const cloneContainers = ['head', 'body'];

    for (const tag of cloneContainers) {
      if (this.document[tag] == null) {
        this.document.appendChild(this.document.createElement(tag));
      }

      for (const node of Array.from<Element>(bootWindow.document[tag].childNodes)) {
        this.document[tag].appendChild(node.cloneNode(true));
      }
    }
  }
}