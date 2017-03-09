import {NgModule, NgModuleFactory, Type} from '@angular/core';

import {Observable} from 'rxjs';

import {ApplicationFromModule} from '../../application';
import {Snapshot} from '../../snapshot';
import {compileModule} from '../../platform';
import {templateDocument} from './document';

export const moduleFromComponent = (componentType: Type<any>): Type<any> =>
  NgModule({
    declarations: [componentType],
    bootstrap: [componentType],
  })(namedFunction(`${componentType.name}_${randomId()}`, function() {})); // defeat cache

export const moduleFactoryFromComponent = (componentType: Type<any>): Promise<NgModuleFactory<any>> =>
  compileModule(moduleFromComponent(componentType));

export const renderComponentFixture = <M>(componentType: Type<M>): Promise<Observable<Snapshot<void>>> => {
  return renderModuleFixture(moduleFromComponent(componentType));
};

export const loadApplicationFixtureFromModule = <M>(moduleType: Type<M>): ApplicationFromModule<{}, M> => {
  const application = new ApplicationFromModule(moduleType);
  application.templateDocument(templateDocument);
  return application;
};

export const renderModuleFixture = <M>(moduleType: Type<M>): Promise<Observable<Snapshot<void>>> => {
  const application = loadApplicationFixtureFromModule(moduleType);
  application.templateDocument(templateDocument);

  return <Promise<Observable<Snapshot<any>>>> application.prerender();
};

const namedFunction = <T>(name: string, f: Function): Type<T> => {
  const wrappedFunction = new Function('type',
    `return function ${name}() {
        type.apply(this, arguments);
     }`);

  return wrappedFunction(f);
};

export const randomId = () => Math.random().toString(16).slice(2);