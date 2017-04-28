import {NgModuleRef, Provider, Type} from '@angular/core';

import {Observable} from 'rxjs';

import {Application, ApplicationBuilder, ApplicationBuilderFromModule} from '../../application';
import {BasicRoutedModule} from './application-routed';
import { ServerPlatform, createJitPlatform, forkZone } from '../../platform';
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

export interface RunInsideApplication {
  run(fn: (moduleRef: NgModuleRef<any>) => void | Promise<void>): Promise<void>;

  dispose(): void;
}

export const runInsideApplication = async (uri: string, providers: Array<Provider> = []): Promise<RunInsideApplication> => {
  const platform: ServerPlatform = createJitPlatform() as ServerPlatform;

  let moduleRef: NgModuleRef<any>;

  let exception: Error;

  const zone = forkZone(templateDocument, uri, {
    onHandleError: function (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error) {
      exception = error;
    }
  });

  await zone.runGuarded<Promise<void>>(async () => {
    moduleRef = await platform.bootstrapModule(BasicRoutedModule, {}, providers);
  });

  return {
    run(fn: (moduleRef: NgModuleRef<any>) => void | Promise<void>): Promise<void> {
      if (exception) {
        return Promise.reject(exception);
      }
      return zone.runGuarded<Promise<void>>(() => Promise.resolve(fn(moduleRef)));
    },
    dispose() {
      try {
        moduleRef.destroy();
      }
      finally {
        platform.destroy();
      }
    }
  };
};
