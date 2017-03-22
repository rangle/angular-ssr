import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {ApplicationFromModule} from '../../application';
import {Snapshot} from '../../snapshot';
import {templateDocument} from './document';

export const loadApplicationFixtureFromModule = <M>(moduleType: Type<M>): ApplicationFromModule<{}, M> => {
  const application = new ApplicationFromModule(moduleType);
  application.templateDocument(templateDocument);
  return application;
};

export const renderModuleFixture = async <M>(moduleType: Type<M>): Promise<Observable<Snapshot<void>>> => {
  const application = loadApplicationFixtureFromModule(moduleType);
  try {
    return <Observable<Snapshot<any>>> await application.prerender();
  }
  finally {
    application.dispose();
  }
};
