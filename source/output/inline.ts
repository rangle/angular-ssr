import {join} from 'path';

import {ApplicationFallbackOptions} from '../static';
import {PathReference, fileFromString} from '../filesystem';
import {RuntimeException} from '../exception';
import {createModernWindow} from '../runtime/browser-emulation/create';

export const inlineResources = (path: PathReference, rendered: string): string => {
  try {
    const uri = ApplicationFallbackOptions.fallbackUri;

    const window = createModernWindow(rendered, uri);
    try {
      const links = Array.from(window.document.querySelectorAll('link[rel="stylesheet"]'));

      for (const link of links) {
        const resource = readResource(window.document, path, link as HTMLLinkElement);
        if (resource == null) {
          continue;
        }

        window.document.head.replaceChild(resource, link);
      }

      return window.document.documentElement.outerHTML;
    }
    finally {
      window.close();
    }
  }
  catch (exception) {
    throw new RuntimeException('Failed to inline resources', exception);
  }
};

const readResource = (document: Document, path: PathReference, link: HTMLLinkElement): HTMLStyleElement => {
  if (link.href == null || link.href.length === 0) {
    return null;
  }

  const href = Array.from(link.attributes).find(a => a.localName.toLowerCase() === 'href');
  if (href == null) {
    return null;
  }

  const file = fileFromString(join(path.toString(), href.value));
  if (file.exists() === false) {
    return null;
  }

  const element = document.createElement('style');
  element.setAttribute('type', 'text/css');
  element.setAttribute('media', link.media);
  element.textContent = file.content();
  return element;
};