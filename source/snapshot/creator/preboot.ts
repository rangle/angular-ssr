import {NgModuleRef} from '@angular/core';

import {DocumentContainer} from '../../platform/document/container';
import {RenderVariantOperation} from '../../application/operation';
import {injectIntoDocument} from './inject';

const prebootImpl = require('preboot');

export const injectPreboot = <M>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<any>) => {
  const {scope: {preboot}} = vop;

  if (preboot) {
    const container = moduleRef.injector.get(DocumentContainer);

    injectIntoDocument(container.document, prebootImpl.getInlineCode(preboot));
  }
};
