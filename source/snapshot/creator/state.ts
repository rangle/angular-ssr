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
  try {
    const serialized = JSON.stringify(state);

    injectIntoDocument(document, `window.bootstrapApplicationState = ${serialized};`);
  }
  catch (exception) {
    console.error(`Cannot inject state into document because it cannot be serialized`, state, exception);
  }
};