import {NgModuleRef, Provider} from '@angular/core';

import {BasicRoutedModule} from './application-routed';
import {ServerPlatform, createJitPlatform, forkZone} from '../../platform';
import {templateDocument} from './document';
import {ApplicationFallbackOptions} from '../../static';

export interface ApplicationTestContext {
  run(fn: (moduleRef: NgModuleRef<any>) => void | Promise<void>): Promise<void>;

  dispose(): void;
}

export const createApplicationTestContext = async (uri: string = ApplicationFallbackOptions.fallbackUri, providers: Array<Provider> = []): Promise<ApplicationTestContext> => {
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
