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
import {bootstrapModule} from './application';
import {createPlatformInjector} from './injector';
import {mapZoneToInjector} from './zone';

@Injectable()
export class ServerPlatform implements PlatformRef {
  private readonly compilers = new Map<string, Compiler>();

  private readonly references = new Set<NgModuleRef<any>>();

  private destroyers = new Array<() => void>();

  constructor(@Inject(Injector) public injector: Injector) {}

  compileModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions> = []): Promise<NgModuleFactory<M>> {
    const compiler = this.getCompiler(compilerOptions);

    return compiler.compileModuleAsync(moduleType);
  }

  async bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions> = []): Promise<NgModuleRef<M>> {
    const moduleFactory = await this.compileModule(moduleType, compilerOptions);

    return await this.bootstrapModuleFactory(moduleFactory);
  }

  async bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>, bootstrap?: (moduleRef: NgModuleRef<M>) => void | Promise<void>): Promise<NgModuleRef<M>> {
    const zone = new NgZone({enableLongStackTrace: true});

    const injector = createPlatformInjector(this.injector, zone);

    const moduleRef = createInjector(injector, moduleFactory);

    const unmap = mapZoneToInjector(Zone.current, moduleRef.injector);

    moduleRef.onDestroy(() => {
      unmap();

      this.references.delete(moduleRef);
    });

    moduleRef.create();

    if (typeof bootstrap === 'function') {
      await Promise.resolve(bootstrap(moduleRef));
    }

    await bootstrapModule(zone, moduleRef).then(() => this.references.add(moduleRef));

    return moduleRef;
  }

  private getCompiler(compilerOptions?: CompilerOptions | Array<CompilerOptions>): Compiler {
    const options = array(compilerOptions || {});

    const key = JSON.stringify(options);

    let compiler = this.compilers.get(key);
    if (compiler == null) {
      const instantiate = (compilerFactory: CompilerFactory) => compilerFactory.createCompiler(options);

      compiler = instantiate(this.injector.get(CompilerFactory));

      this.compilers.set(key, compiler);
    }

    return compiler;
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

    this.compilers.clear();
  }
}

type InstantiableModule<M> = NgModuleRef<M> & {create: () => void};

// It would be great if we did not have to access this private member, but the fact is we need a reference to the
// injector instance before create() is called on it, so that we can apply the zone mapping before any instantiation
// of modules or components happens. Otherwise, if someone attempts to start an HTTP request from inside of a module
// constructor it will fail with nasty messages about how there is no zone mapping.
const createInjector = <M>(injector: Injector, moduleFactory: NgModuleFactory<M>): InstantiableModule<M> => new moduleFactory['_injectorClass'](injector);
