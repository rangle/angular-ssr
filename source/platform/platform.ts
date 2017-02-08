import {
  CompilerOptions,
  NgModuleRef,
  NgModuleFactory,
  PlatformRef,
  Provider,
  Injector,
  Type
} from '@angular/core';

export class PlatformImpl implements PlatformRef {
  public injector: Injector;

  public destroyed: boolean = false;

  constructor(private providers: Array<Provider> = []) {
    throw new Error('Not implemented');
  }

  async bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    throw new Error('Not implemented');
  }

  async bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: CompilerOptions | CompilerOptions[]): Promise<NgModuleRef<M>> {
    throw new Error('Not implemented');
  }

  onDestroy(callback: () => void) {
    throw new Error('Not implemented');
  }

  destroy() {
    throw new Error('Not implemented');
  }
}
