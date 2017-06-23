import {ApplicationFallbackOptions} from '../static';
import {OutputOptions} from './options';
import {PathReference} from '../filesystem/contracts';
import {Snapshot} from '../snapshot/snapshot';

import {createModernWindow} from '../runtime/browser-emulation/create';
import {inlineStylesheets} from './stylesheets';
import {inlineVectorGraphics} from './svg';

export const transformInplace = <V>(path: PathReference, snapshot: Snapshot<V>, options: OutputOptions): void => {
  if (options.inlineStylesheets || options.inlineVectorGraphics) {
    const uri = ApplicationFallbackOptions.fallbackUri;

    const window = createModernWindow(snapshot.renderedDocument, uri);

    try {
      if (options.inlineStylesheets) {
        inlineStylesheets(path, window.document);
      }

      if (options.inlineVectorGraphics) {
        inlineVectorGraphics(window.document);
      }

      snapshot.renderedDocument = document.documentElement.outerHTML;
    }
    finally {
      window.close();
    }
  }

  if (/^<\!DOCTYPE html>/i.test(snapshot.renderedDocument) === false) { // ensure result has a doctype
    snapshot.renderedDocument = `<!DOCTYPE html>${snapshot.renderedDocument}`;
  }
};