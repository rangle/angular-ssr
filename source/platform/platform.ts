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
import {mapZoneToInjector, waitForApplicationToBecomeStable} from './zone';

@Injectable()
export class PlatformImpl implements PlatformRef {
  private compiler: Compiler;

  private readonly compiledModules = new Map<Type<any>, NgModuleFactory<any>>();

  private readonly references = new Set<NgModuleRef<any>>();

  private destroyers = new Array<() => void>();

  constructor(@Inject(Injector) public injector: Injector) {}

  async compileModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions>) {
    const compiler = this.getCompiler(compilerOptions);

    if (specializedCompilerOptions(compilerOptions)) {
      return await compiler.compileModuleAsync(moduleType);
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

    return moduleRef;
  }

  private getCompiler(compilerOptions?: CompilerOptions | Array<CompilerOptions>): Compiler {
    const createCompiler = () => {
      const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);

      return compilerFactory.createCompiler(array(compilerOptions || {}));
    };

    if (specializedCompilerOptions(compilerOptions)) {
      return createCompiler();
    }
    else {
      if (this.compiler == null) {
        this.compiler = createCompiler();
      }
      return this.compiler;
    }
  }

  onDestroy(callback: () => void) {
    if (this.destroyed) {
      throw new PlatformException(`It does not make sense to register an onDestroy handler after destroy has already taken place`);
    }
    this.destroyers.push(callback);
  }

  get destroyed(): boolean {
    return this.destroyers == null;
  }

  async destroy() {
    if (this.destroyers != null) {
      const destroyers = this.destroyers.slice();

      this.destroyers = undefined;

      // We want to avoid destroying a module that is in the middle of some asynchronous
      // operations, because the handlers for those operations are likely to blow up in
      // spectacular ways if their entire execution context has been ripped out from under
      // them. So we wait for the zone associated with the module to become stable before
      // we attempt to dispose of it. But in practice we will probably never wait because
      // we already waited for zone stability on startup.
      const promises = Array.from(this.references).map(
        module => waitForApplicationToBecomeStable(module, 1500)
          .then(() => {
            module.destroy();
          })
          .catch(exception => Promise.resolve(void 0)));

      Promise.all(promises).then(() => destroyers.forEach(handler => handler()));

      if (this.compiler) {
        this.compiler.clearCache();
        this.compiler = null;
      }

      this.compiledModules.clear();
    }
  }
}

const specializedCompilerOptions = (compilerOptions: CompilerOptions | Array<CompilerOptions>) => {
  if (compilerOptions) {
    if (Array.isArray(compilerOptions)) {
      return compilerOptions.length > 0;
    }
    return Object.keys(compilerOptions).length > 0;
  }
  return false;
};
