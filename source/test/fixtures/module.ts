import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {Application, ApplicationBuilder, applicationBuilderFromModule} from '../../application';
import {Snapshot} from '../../snapshot';
import {templateDocument} from './document';

export const loadApplicationFixtureFromModule = <M>(moduleType: Type<M>, fn?: (builder: ApplicationBuilder<any>) => void): Application<{}> => {
  const builder = applicationBuilderFromModule(moduleType);
  builder.templateDocument(templateDocument);

  if (fn) {
    fn(builder);
  }

  return builder.build();
};

export const renderModuleFixture = <M>(moduleType: Type<M>): Observable<Snapshot<void>> => {
  const application = loadApplicationFixtureFromModule(moduleType);

  const observable = application.prerender();

  const dispose = () => application.dispose();

  observable.subscribe(dispose, dispose);

  return observable as Observable<Snapshot<any>>;
};

