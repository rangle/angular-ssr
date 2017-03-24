import {
  Compiler,
  CompilerFactory,
  CompilerOptions,
  Injectable,
  Injector,
  Inject,
  NgModuleFactory,
  NgModuleRef,
  NgZone,
  PlatformRef,
  Type,
} from '@angular/core';

import {PlatformException} from '../exception';

import {array} from '../transformation';

import {bootstrapModule} from './bootstrap';

import {createPlatformInjector} from './injector';

import {mapZoneToInjector, waitForZoneToBecomeStable} from './zone';

@Injectable()
export class PlatformImpl implements PlatformRef {
  private compiler: Compiler;

  private compiledModules = new Map<Type<any>, NgModuleFactory<any>>();

  private references = new Set<NgModuleRef<any>>();

  public destroyed = false;

  constructor(@Inject(Injector) public injector: Injector) {}

  async compileModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions>) {
    if (specializedCompilerOptions(compilerOptions)) {
      throw new PlatformException('Do not pass compiler options to compileModule because it defeats caching');
    }

    let cached = this.compiledModules.get(moduleType);
    if (cached == null) {
      const compiler = this.getCompiler();

      cached = await compiler.compileModuleAsync(moduleType);

      this.compiledModules.set(moduleType, cached);
    }

    return cached;
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

    await bootstrapModule(zone, moduleRef).then(() => this.references.add(moduleRef));

    await waitForZoneToBecomeStable(moduleRef);

    return moduleRef;
  }

  private getCompiler(compilerOptions?: CompilerOptions | Array<CompilerOptions>): Compiler {
    if (this.compiler == null) {
      const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);

      this.compiler = compilerFactory.createCompiler(array(compilerOptions || {}));
    }

    return this.compiler;
  }

  async destroy() {
    if (this.destroyed === false) {
      this.destroyed = true;

      for (const module of Array.from(this.references)) {
        // We want to avoid destroying a module that is in the middle of some asynchronous
        // operations, because the handlers for those operations are likely to blow up in
        // spectacular ways if their entire execution context has been ripped out from under
        // them. So we wait for the zone associated with the module to become stable before
        // we attempt to dispose of it.
        waitForZoneToBecomeStable(module).then(() => {
          try {
            module.destroy();
          }
          catch (exception) {}
        });
      }

      if (this.compiler) {
        this.compiler.clearCache();
        this.compiler = null;
      }

      this.compiledModules.clear();
    }
  }

  onDestroy(callback: () => void) {
    throw new PlatformException('Not implemented');
  }
}

const specializedCompilerOptions = (compilerOptions: CompilerOptions | Array<CompilerOptions>) => {
  if (compilerOptions) {
    if (Array.isArray(compilerOptions)) {
      return compilerOptions.length > 0;
    }
    return true;
  }
  return false;
};
