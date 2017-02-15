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
  ReflectiveInjector,
  RootRenderer,
  PlatformRef,
  Type,
} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

import {PlatformException} from '../exception';
import {DocumentContainer, TemplateDocument, RequestUri} from '../document';
import {RootRendererImpl} from '../render';
import {DocumentStyles, SharedStyles} from '../styles';
import {CurrentZone, stableZone} from '../zone';
import {Publisher} from 'publisher';

@Injectable()
export class PlatformImpl implements PlatformRef {
  private disposal = new Publisher<() => void>();

  private compiler: Compiler;

  private compiledModules = new Map<string, NgModuleFactory<any>>();

  private live = new Set<NgModuleRef<any>>();

  private disposed: boolean = false;

  constructor(private rootInjector: Injector) {}

  get injector(): Injector {
    return this.rootInjector;
  }

  get destroyed(): boolean {
    return this.disposed;
  }

  async compileModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions>) {
    if (nonstandardOptions(compilerOptions)) {
      // We cannot use our cached compiler or cached modules if the compilation options
      // have changed. The majority of callers of this method are not going to be giving
      // compilerOptions, so this is an unusual path for the code to take and is not
      // necessary to optimize with caching.
      const compiler = this.getCompiler(compilerOptions);
      try {
        return await compiler.compileModuleAsync(moduleType);
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

    return await zone.run(async () => {
      const moduleRef = moduleFactory.create(this.injectorFactory(zone));
      try {
        if (moduleRef.injector.get(BrowserModule, null) != null) {
          throw new PlatformException('You cannot use an NgModuleFactory that has been compiled with a BrowserModule import');
        }

        moduleRef.onDestroy(() => this.live.delete(moduleRef));

        await this.completeBootstrap(zone, moduleRef);

        return moduleRef;
      }
      catch (exception) {
        moduleRef.destroy();

        throw exception;
      }
    });
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

  private async completeBootstrap<M>(zone: NgZone, moduleRef: NgModuleRef<M>) {
    const exceptionHandler: ErrorHandler = moduleRef.injector.get(ErrorHandler);

    zone.onError.subscribe(exception => exceptionHandler.handleError(exception));

    await moduleRef.injector.get(ApplicationInitStatus).donePromise;

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

    this.live.add(moduleRef);
  }

  private injectorFactory(ngZone: NgZone): Injector {
    const providers = [
      {provide: NgZone, useValue: ngZone},
      {provide: DocumentContainer, useClass: DocumentContainer},
      {provide: RootRenderer, useClass: RootRendererImpl},
      {provide: SharedStyles, useClass: SharedStyles},
      {provide: DocumentStyles, useClass: DocumentStyles},
      {
        provide: TemplateDocument,
        useFactory: (currentZone: CurrentZone) => {
          return currentZone.parameter<string>('documentTemplate');
        },
        deps: [CurrentZone],
      },
      {
        provide: RequestUri,
        useFactory: (currentZone: CurrentZone) => {
          return currentZone.parameter<string>('requestUri');
        },
        deps: [CurrentZone],
      },
    ];

    return ReflectiveInjector.resolveAndCreate(providers, this.injector);
  }

  onDestroy(callback: () => void) {
    this.disposal.subscribe(callback);
  }

  async destroy() {
    if (this.disposed === true) {
      throw new PlatformException('Attempting to dispose of the same PlatformImpl twice');
    }

    this.disposal.publish();

    for (const module of Array.from(this.live)) {
      // We want to avoid destroying a module that is in the middle of some asynchronous
      // operations, because the handlers for those operations are likely to blow up in
      // spectacular ways if their entire execution context has been ripped out from under
      // them. So we wait for the zone associated with the module to become stable before
      // we attempt to dispose of it.
      stableZone(module).then(() => {
        module.destroy();

        this.live.delete(module);
      });
    }

    this.compiledModules.clear();

    this.disposed = true;
  }
}

const nonstandardOptions = (compilerOptions: CompilerOptions | Array<CompilerOptions>) => {
  if (Array.isArray(compilerOptions)) {
    return compilerOptions.length > 0;
  }
  return compilerOptions != null;
};