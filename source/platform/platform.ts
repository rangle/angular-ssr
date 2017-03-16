import {
  ApplicationInitStatus,
  ApplicationRef,
  Compiler,
  CompilerFactory,
  CompilerOptions,
  ErrorHandler,
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleRef,
  NgZone,
  PlatformRef,
  Type,
} from '@angular/core';

import {PlatformException} from '../exception';

import {createPlatformInjector} from './injector';

import {
  mapZoneToInjector,
  waitForZoneToBecomeStable,
} from './zone';

@Injectable()
export class PlatformImpl implements PlatformRef {
  private compiler: Compiler;

  private compiledModules = new Map<string, NgModuleFactory<any>>();

  private references = new Set<NgModuleRef<any>>();

  public destroyed = false;

  constructor(public injector: Injector) {}

  async compileModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions>) {
    if (nonstandardOptions(compilerOptions)) {
      // We cannot use our cached compiler or cached modules if the compilation options
      // have changed. The majority of callers of this method are not going to be giving
      // compilerOptions, so this is an unusual path for the code to take and is not
      // necessary to optimize with caching.
      const compiler = this.getCompiler(compilerOptions);
      try {
        const {ngModuleFactory} = await compiler.compileModuleAndAllComponentsAsync(moduleType);
        return ngModuleFactory;
      }
      finally {
        compiler.clearCache();
      }
    }

    if (this.compiledModules.has(moduleType.name) === false) {
      const compiler = this.getCompiler(compilerOptions);

      const moduleFactory = await compiler.compileModuleAsync(moduleType);

      this.compiledModules.set(moduleType.name, moduleFactory);
    }

    return this.compiledModules.get(moduleType.name);
  }

  async bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions> = []): Promise<NgModuleRef<M>> {
    const moduleFactory = await this.compileModule(moduleType, compilerOptions);

    return await this.bootstrapModuleFactory(moduleFactory);
  }

  async bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    const zone = new NgZone({enableLongStackTrace: true});

    const injector = createPlatformInjector(this.injector, zone);

    const moduleRef = moduleFactory.create(injector);

    const unmap = mapZoneToInjector(moduleRef.injector);

    moduleRef.onDestroy(() => {
      unmap();

      this.references.delete(moduleRef);
    });

    await this.completeBootstrap(zone, moduleRef);

    return moduleRef;
  }

  private getCompiler(compilerOptions: CompilerOptions | Array<CompilerOptions>): Compiler {
    const create = () => {
      const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);

      return compilerFactory.createCompiler(Array.isArray(compilerOptions) ? compilerOptions : [compilerOptions]);
    };

    if (compilerOptions != null) {
      return create();
    }
    else {
      if (this.compiler == null) {
        this.compiler = create();
      }
      return this.compiler;
    }
  }

  private completeBootstrap<M>(zone: NgZone, moduleRef: NgModuleRef<M>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const exceptionHandler: ErrorHandler = moduleRef.injector.get(ErrorHandler);

      zone.onError.subscribe(
        exception => {
          exceptionHandler.handleError(exception);
          reject(exception);
        });

      const applicationInit = moduleRef.injector.get(ApplicationInitStatus, null);
      if (applicationInit == null) {
        throw new PlatformException(`Your application module ${moduleRef.instance.constructor} does not import ApplicationModule, but it must`);
      }

      applicationInit.donePromise.then(() => {
        const applicationRef = moduleRef.injector.get(ApplicationRef);

        const {bootstrapFactories, instance: {ngDoBootstrap}} = <any> moduleRef;
        if (bootstrapFactories.length > 0) {
          for (const component of bootstrapFactories) {
            applicationRef.bootstrap(component);
          }
        }
        else if (typeof ngDoBootstrap === 'function') {
          ngDoBootstrap.bind(moduleRef.instance)(applicationRef);
        }
        else {
          throw new PlatformException(`Module declares neither bootstrap nor ngDoBootstrap`);
        }

        this.references.add(moduleRef);

        resolve();
      })
      .catch(exception => {
        reject(exception);
      });
    });
  }

  async destroy() {
    this.destroyed = true;

    for (const module of Array.from(this.references)) {
      // We want to avoid destroying a module that is in the middle of some asynchronous
      // operations, because the handlers for those operations are likely to blow up in
      // spectacular ways if their entire execution context has been ripped out from under
      // them. So we wait for the zone associated with the module to become stable before
      // we attempt to dispose of it.
      waitForZoneToBecomeStable(module).then(() => module.destroy());

      this.references.delete(module);
    }

    this.compiledModules.clear();
  }

  onDestroy(callback: () => void) {
    throw new PlatformException('Not implemented');
  }
}

const nonstandardOptions = (compilerOptions: CompilerOptions | Array<CompilerOptions>) => {
  if (compilerOptions) {
    if (Array.isArray(compilerOptions)) {
      return compilerOptions.length > 0;
    }
    return true;
  }
  return false;
};
