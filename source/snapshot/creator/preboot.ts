import {NgModuleRef} from '@angular/core';

import {ConfigurationException} from '../../exception';
import {DocumentContainer} from '../../platform/document/container';
import {RenderVariantOperation} from '../../application/operation';
import {flatten} from '../../transformation/flatten';
import {injectIntoDocument} from './inject';

import prebootImpl = require('preboot');

export const injectPreboot = <M>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<any>) => {
  const {scope: {preboot}} = vop;
  if (!preboot) { // disabled
    return;
  }

  const elements = <T>(array: ArrayLike<T>) => array != null && array.length > 0;

  const noSeparateRoots =
    !elements(preboot.serverClientRoot) ||
      preboot.serverClientRoot.some(r => !elements(r.clientSelector) || !elements(r.serverSelector));

  const noSingleRoot = preboot.appRoot == null || preboot.appRoot.length === 0;

  const autodetect = noSeparateRoots === true && noSingleRoot === true;
  if (autodetect) {
    const {bootstrapFactories} = moduleRef as {bootstrapFactories?};

    if (bootstrapFactories == null || bootstrapFactories.length === 0) {
      throw new ConfigurationException(`Cannot auto-detect preboot root because no components are defined in module 'bootstrap' properties`);
    }

    const selectors = c => {
      if (c.factory == null ||
          c.factory.selector == null ||
          c.factory.selector.length === 0) {
        return null;
      }
      return c.factory.selector.split(/[\s,]/g).filter(v => v);
    };

    preboot.appRoot = flatten<string>(bootstrapFactories.map(selectors)).filter(v => v);
  }

  const container = moduleRef.injector.get(DocumentContainer);

  injectIntoDocument(container.document, prebootImpl.getInlineCode(preboot));
};