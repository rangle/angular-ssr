import {RuntimeException} from '../exception';

import {PathReference, absoluteFile} from '../filesystem';

import {createModernWindow} from '../runtime/browser-emulation/create';

export const inlineResources = (path: PathReference, rendered: string): string => {
  try {
    const window = createModernWindow(rendered, 'about:none');
    try {
      const links = Array.from(window.document.querySelectorAll('head link[rel="stylesheet"]'));

      for (const link of links) {
        const resource = readResource(window.document, path, link as HTMLLinkElement);
        if (resource == null) {
          continue;
        }

        link.remove();

        window.document.head.appendChild(resource);
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

  const file = absoluteFile(path, link.href.replace(/([^\\])\//g, '$1\\'));
  if (file.exists() === false) {
    return null;
  }

  const element = document.createElement('style');
  element.setAttribute('type', 'text/css');
  element.setAttribute('media', link.media);
  element.textContent = file.content();
  return element;
};