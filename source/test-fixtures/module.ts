import {NgModule, NgModuleFactory, Type} from '@angular/core';

import {Observable} from 'rxjs';

import {ApplicationFromModule} from 'application';
import {Snapshot} from 'snapshot';
import {compileModule} from 'platform';
import {documentTemplate} from './document';

export const moduleFromComponent = (componentType: Type<any>): Type<any> =>
  NgModule({
    declarations: [componentType],
    bootstrap: [componentType],
  })(namedFunction(`${componentType.name}_${randomId()}`, function() {})); // defeat cache

export const moduleFactoryFromComponent = async (componentType: Type<any>): Promise<NgModuleFactory<any>> =>
  await compileModule(moduleFromComponent(componentType));

export const renderFixture = async <M>(componentType: Type<M>): Promise<Observable<Snapshot<void>>> => {
  const module = moduleFromComponent(componentType);

  const application = new ApplicationFromModule<void, any>(module);
  application.templateDocument(documentTemplate);

  return await application.render();
};

const namedFunction = <T>(name: string, f: Function): Type<T> => {
  const wrappedFunction = new Function('type',
    `return function ${name}() {
        type.apply(this, arguments);
     }`);

  return wrappedFunction(f);
};

export const randomId = () => Math.random().toString(16).slice(2);