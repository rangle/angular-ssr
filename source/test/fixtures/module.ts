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

export const renderModuleFixture = <M>(moduleType: Type<M>): Promise<Observable<Snapshot<void>>> => {
  const application = loadApplicationFixtureFromModule(moduleType);
  application.templateDocument(templateDocument);

  return <Promise<Observable<Snapshot<any>>>> application.prerender();
};

export const randomId = () => Math.random().toString(16).slice(2);