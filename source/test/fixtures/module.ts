import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {Application, ApplicationBuilder, ApplicationBuilderFromModule} from '../../application';
import {Snapshot} from '../../snapshot';
import {templateDocument} from './document';

export const loadApplicationFixtureFromModule = <M>(moduleType: Type<M>, fn?: (builder: ApplicationBuilder<any>) => void): Application<{}> => {
  const builder = new ApplicationBuilderFromModule(moduleType);
  builder.templateDocument(templateDocument);
  if (fn) {
    fn(builder);
  }
  return builder.build();
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

