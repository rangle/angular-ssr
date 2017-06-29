import {
  Compiler,
  CompilerFactory,
  CompilerOptions,
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleRef,
  NgZone,
  PlatformRef,
  Provider,
  Type,
} from '@angular/core';

import {PlatformException} from '../exception';
import {array} from '../transformation';
import {bootstrapModule} from './application';
import {createPlatformInjector} from './injector';
import {mapZoneToInjector} from './zone';

@Injectable()
export class ServerPlatform implements PlatformRef {
  private readonly references = new Set<NgModuleRef<any>>();

  private destroyers = new Array<() => void>();

  constructor(public injector: Injector) {}

  compileModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions> = []): Promise<NgModuleFactory<M>> {
    const compiler = this.getCompiler(compilerOptions);

    return compiler.compileModuleAsync(moduleType);
  }

  async bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions> = [], providers?: Array<Provider>): Promise<NgModuleRef<M>> {
    const module = await this.compileModule(moduleType, compilerOptions);

    return await this.bootstrapModuleFactory(module, providers);
  }

  async bootstrapModuleFactory<M>(module: NgModuleFactory<M>, providers?: Array<Provider>, bootstrap?: (moduleRef: NgModuleRef<M>) => void | Promise<void>): Promise<NgModuleRef<M>> {
    const zone = new NgZone({enableLongStackTrace: true});

    const injector = createPlatformInjector(this.injector, zone, providers);

    const moduleRef = module.create(injector);

    const unmap = mapZoneToInjector(Zone.current, moduleRef.injector);

    moduleRef.onDestroy(() => {
      unmap();

      this.references.delete(moduleRef);
    });

    if (typeof bootstrap === 'function') {
      await Promise.resolve(bootstrap(moduleRef));
    }

    await bootstrapModule(zone, moduleRef).then(() => this.references.add(moduleRef));

    return moduleRef;
  }

  private getCompiler(compilerOptions?: CompilerOptions | Array<CompilerOptions>): Compiler {
    const options = array(compilerOptions || {});

    const instantiate = (compilerFactory: CompilerFactory) => compilerFactory.createCompiler(options);

    return instantiate(this.injector.get(CompilerFactory));
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
    if (this.destroyed) {
      return;
    }

    const destroyers = this.destroyers;

    delete this.destroyers;

    // The zone of an application zone at this point in the process is either already stable or will never become
    // stable. We can deduce this because we already waited for it to become stable as part of the bootstrap, and
    // either it did indeed become stable and therefore is still stable now, or we timed out waiting for it to become
    // stable, which indicates a likelihood that the application will never become stable because it has some kind
    // of setInterval running continuously.
    this.references.forEach(module => module.destroy());

    destroyers.forEach(handler => handler());
  }
}

Object.assign(ServerPlatform, {
  decorators: [{type: Injectable}],
  ctorParameters: () => [{type: Injector}]
});
