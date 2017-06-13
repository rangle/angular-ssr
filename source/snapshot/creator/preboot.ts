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
    const {_bootstrapComponents} = moduleRef as {_bootstrapComponents?};

    if (_bootstrapComponents == null || _bootstrapComponents.length === 0) {
      throw new ConfigurationException(`Cannot auto-detect preboot root because no components are defined in module 'bootstrap' properties`);
    }

    const selectors = c => {
      const component = Reflect.getOwnMetadata('annotations', c).find(c => c.toString() === '@Component');
      if (component == null ||
          component.selector == null ||
          component.selector.length === 0) {
        return null;
      }
      return component.selector.split(/[\s,]/g).filter(v => v);
    };

    preboot.appRoot = flatten<string>(_bootstrapComponents.map(selectors)).filter(v => v);
  }

  const container = moduleRef.injector.get(DocumentContainer);

  injectIntoDocument(container.document, prebootImpl.getInlineCode(preboot));
};