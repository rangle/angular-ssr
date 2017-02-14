import {
  ApplicationInitStatus,
  ApplicationRef,
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

import {PlatformException} from './exception';
import {DocumentContainer, TemplateDocument, RequestUri} from '../document';
import {RootRendererImpl} from '../render';
import {DomSharedStyles, SharedStyles} from '../styles';
import {CurrentZone} from '../zone';

@Injectable()
export class PlatformImpl implements PlatformRef {
  private destructionCallbacks = new Set<() => void>();

  private compiledCache = new Map<string, NgModuleFactory<any>>();

  private runningModules = new Set<NgModuleRef<any>>();

  private disposed = false;

  constructor(private rootInjector: Injector) {}

  onDestroy(callback: () => void) {
    this.destructionCallbacks.add(callback);
  }

  get injector(): Injector {
    return this.rootInjector;
  }

  get destroyed(): boolean {
    return this.disposed;
  }

  destroy() {
    for (const module of Array.from(this.runningModules)) {
      module.destroy();
    }

    this.runningModules.clear();

    this.compiledCache.clear();

    for (const destructionCallback of Array.from(this.destructionCallbacks)) {
      destructionCallback();
    }

    this.destructionCallbacks.clear();

    this.disposed = true;
  }

  async bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    const ngZone = new NgZone({
      enableLongStackTrace: true
    });

    return await ngZone.run(async () => {
      const moduleRef = moduleFactory.create(this.injectorFactory(ngZone));

      moduleRef.onDestroy(() => this.runningModules.delete(moduleRef));

      const exceptionHandler: ErrorHandler = moduleRef.injector.get(ErrorHandler);

      ngZone.onError.subscribe(exception => exceptionHandler.handleError(exception));

      const {donePromise: initialized} = moduleRef.injector.get(ApplicationInitStatus);
      await initialized;

      this.completeBootstrap(moduleRef);

      this.runningModules.add(moduleRef);

      return moduleRef;
    });
  }

  async bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions | Array<CompilerOptions> = []): Promise<NgModuleRef<M>> {
    if (this.compiledCache.has(moduleType.name)) {
      return this.bootstrapModuleFactory(this.compiledCache.get(moduleType.name));
    }

    const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);

    const compiler =
      compilerFactory.createCompiler(
        Array.isArray(compilerOptions) ? compilerOptions : [compilerOptions]);

    const moduleFactory = await compiler.compileModuleAsync(moduleType);

    this.compiledCache.set(moduleType.name, moduleFactory);

    return this.bootstrapModuleFactory(moduleFactory);
  }

  private completeBootstrap(moduleRef) {
    const applicationRef = moduleRef.injector.get(ApplicationRef);

    const {bootstrapFactories, instance: {ngDoBootstrap}} = moduleRef;

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
  }

  private injectorFactory(ngZone: NgZone): Injector {
    const providers = [
      {provide: NgZone, useValue: ngZone},
      {provide: DocumentContainer, useClass: DocumentContainer},
      {provide: RootRenderer, useClass: RootRendererImpl},
      {provide: SharedStyles, useClass: SharedStyles},
      {provide: DomSharedStyles, useClass: DomSharedStyles},
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
}
