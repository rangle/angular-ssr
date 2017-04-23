import {NgModuleRef, Provider, Type} from '@angular/core';

import {Observable} from 'rxjs';

import {Application, ApplicationBuilder, ApplicationBuilderFromModule} from '../../application';
import {BasicRoutedModule} from './application-routed';
import {ServerPlatform, createJitPlatform, forkZone} from '../../platform';
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

export const runInsideApplication = async (uri: string, fn: (ref: NgModuleRef<any>) => void | Promise<void>, providers: Array<Provider> = []): Promise<void> => {
  const platform: ServerPlatform = createJitPlatform() as ServerPlatform;
  try {
    await forkZone(templateDocument, uri, async () => {
      const moduleRef = await platform.bootstrapModule(BasicRoutedModule, {}, providers);
      try {
        await Promise.resolve(fn(moduleRef));
      }
      finally {
        moduleRef.destroy();
      }
    });
  }
  finally {
    platform.destroy();
  }
};
