import {
  ApplicationModule,
  NgModule,
  Type
} from '@angular/core/index';

import {CommonModule} from '@angular/common/index';

import {Reflector} from './metadata';
import {cleanImports, inlineComponentsFromModule, recursiveCollect} from './mutate';

export const browserModuleToServerModule = <M>(baseType: Type<M>): Type<any> => {
  const moduleType = Reflector.cloneWithDecorators(baseType);

  Reflector.mutateAnnotation(moduleType, NgModule,
    decorator => {
      const imports = cleanImports(decorator.imports || []);

      imports.push(ApplicationModule);
      imports.push(CommonModule);

      const {declarations, exports} = inlineComponentsFromModule(decorator);

      return {imports, exports, declarations};
    });

  const modules = recursiveCollect<NgModule>(moduleType, NgModule, m => m.imports);

  for (const m of modules) {
    Reflector.mutateAnnotation(m, NgModule,
      decorator => {
        const imports = cleanImports(decorator.imports || []);

        const {declarations, exports} = inlineComponentsFromModule(decorator);

        return {imports, declarations, exports};
      });
  }

  return moduleType;
};
