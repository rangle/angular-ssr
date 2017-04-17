import {NgModuleRef} from '@angular/core';

import {ConfigurationException} from '../../exception';
import {DocumentContainer} from '../../platform/document/container';
import {RenderVariantOperation} from '../../application/operation';
import {flatten} from '../../transformation/flatten';
import {injectIntoDocument} from './inject';
import {none} from '../../predicate';

import prebootImpl = require('preboot');

export const injectPreboot = <M>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<any>) => {
  const {scope: {preboot}} = vop;

  if (preboot) {
    if ((preboot.serverClientRoot == null || preboot.serverClientRoot.length === 0) && none(preboot.appRoot)) {
      const {bootstrapFactories} = <NgModuleRef<M> & {bootstrapFactories: Array<any>}> moduleRef;

      if (none(bootstrapFactories)) {
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
  }
};
