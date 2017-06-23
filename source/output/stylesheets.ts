import {join} from 'path';

import {PathReference, fileFromString} from '../filesystem';

import {RuntimeException} from '../exception';

export const inlineStylesheets = (path: PathReference, document: Document): string => {
  try {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    for (const link of links) {
      const resource = readResource(window.document, path, link as HTMLLinkElement);
      if (resource == null) {
        continue;
      }

      link.parentElement.replaceChild(resource, link);
    }

    return window.document.documentElement.outerHTML;
  }
  catch (exception) {
    throw new RuntimeException('Failed to inline stylesheet resources', exception);
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
