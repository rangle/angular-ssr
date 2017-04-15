import {NgModuleRef} from '@angular/core';

import {ConfigurationException} from '../../exception';
import {DocumentContainer} from '../../platform/document/container';
import {RenderVariantOperation} from '../../application/operation';
import {flatten} from '../../transformation/flatten';
import {injectIntoDocument} from './inject';
import {none} from '../../predicate';

let implementation;
try {
  implementation = require('preboot');
}
catch (exception) {}

export const injectPreboot = <M>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<any>) => {
  const {scope: {preboot}} = vop;

  if (preboot) {
    if (implementation == null) {
      throw new ConfigurationException(`Cannot inject preboot when preboot library is not installed`);
    }

    if ((preboot.serverClientRoot == null || preboot.serverClientRoot.length === 0) && none(preboot.appRoot)) {
      const {bootstrapFactories} = <NgModuleRef<M> & {bootstrapFactories: Array<any>}> moduleRef;

      if (none(bootstrapFactories)) {
        throw new ConfigurationException(`Cannot auto-detect preboot root because no components are defined in module 'bootstrap' properties`);
      }

      const selectors = c => (c.selector || String()).split(/[\s,]/g).filter(v => v);

      preboot.appRoot = flatten<string>(bootstrapFactories.map(selectors));
    }

    const container = moduleRef.injector.get(DocumentContainer);

    injectIntoDocument(container.document, implementation.getInlineCode(preboot));
  }
};
