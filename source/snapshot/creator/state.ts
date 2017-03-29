import {NgModuleRef} from '@angular/core';

import {ApplicationStateReader} from '../../application/contracts';
import {injectIntoDocument} from './inject';
import {typeToInjectorFunction} from '../../transformation/type-to-function';

export const injectState = async <M>(moduleRef: NgModuleRef<M>, stateReader: ApplicationStateReader<any>, document: Document) => {
  let applicationState = undefined;

  if (stateReader) {
    const injectorfn = typeToInjectorFunction(stateReader, r => Promise.resolve(r.getState()));

    applicationState = await injectorfn(moduleRef.injector);

    if (applicationState != null) {
      injectStateIntoDocument(document, applicationState);
    }
  }

  return applicationState;
}

const injectStateIntoDocument = (document: Document, state): void => {
  injectIntoDocument(document, `window.bootstrapApplicationState = ${JSON.stringify(state)};`);
};