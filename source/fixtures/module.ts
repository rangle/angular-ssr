import {NgModule, Type} from '@angular/core';

import {Observable} from 'rxjs';

import {BrowserModule} from '@angular/platform-browser';

import {ApplicationFromModule, Snapshot} from 'service';

import {documentTemplate} from './document';

export const moduleFromComponent = (componentType: Type<any>): Type<any> =>
  NgModule({
    imports: [BrowserModule],
    declarations: [componentType],
    bootstrap: [componentType],
  })(namedFunction(`${componentType.name}_${randomId()}`, function() {})); // defeat cache

export const renderFixture = async <M>(componentType: Type<M>): Promise<Observable<Snapshot<void>>> => {
  const application = new ApplicationFromModule<void, any>(moduleFromComponent(componentType));
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