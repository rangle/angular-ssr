import {
  OpaqueToken,
  NgModule,
  Provider,
} from '@angular/core/index';

import {BrowserModule} from '@angular/platform-browser/index';

import {Reflector} from '../reflector';

import {ngModuleDecorator} from './../../../../identifiers/decorators';

@NgModule({
  imports: [
    BrowserModule,
  ],
  providers: [
    {provide: new OpaqueToken(`Ron O'Neal`), useValue: 'Sean Price'},
  ]
})
export class ExampleClass {}

describe('reflector', () => {
  it('can clone a class with decorators and retain its name', () => {
    const newClass = Reflector.cloneWithDecorators(ExampleClass);

    expect(newClass.name).toBe('ExampleClass');
  });

  it('can clone a class and its decorators', () => {
    const newClass = Reflector.cloneWithDecorators(ExampleClass);

    const annotations = Reflector.annotations(newClass);

    expect(annotations.length).toBe(1);
    expect(annotations[0].toString()).toBe(`@${ngModuleDecorator}`);
  });

  it('can clone a class and mutate a specific decorator without touching the original', () => {
    const newClass = Reflector.cloneWithDecorators(ExampleClass);

    Reflector.mutateAnnotation(newClass, NgModule,
      ngModule => {
        const existingProviders: Array<Provider> = ngModule.providers || [];

        return {
          providers: [
            ...existingProviders,
            {provide: new OpaqueToken('MyToken'), useValue: 'My value'},
          ]
        };
      });

    const annotations = Reflector.annotations(newClass);
    expect(annotations.length).toBe(1);
    expect(annotations[0].providers).not.toBeNull();
    expect(annotations[0].providers.length).toBe(2);
    expect(annotations[0].providers[0].useValue).toBe('Sean Price');
    expect(annotations[0].providers[1].useValue).toBe('My value');
  });
});