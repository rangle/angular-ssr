import {OpaqueToken, NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

import {Reflector} from '../reflector';

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
  it('should clone a class with decorators and retain its name', () => {
    const newClass = Reflector.cloneWithDecorators(ExampleClass);

    expect(newClass.name).toBe('ExampleClass');
  });

  it('should clone a class and its decorators', () => {
    const newClass = Reflector.cloneWithDecorators(ExampleClass);

    const annotations = Reflector.annotations(newClass);

    expect(annotations.length).toBe(1);
    expect(annotations[0].toString()).toBe('@NgModule');
  });

  it('should clone a class and mutate a specific decorator', () => {
    const newClass = Reflector.cloneWithDecorators(ExampleClass);

    Reflector.mutateAnnotation(newClass, NgModule,
      ngModule => {
        
        return ngModule;
      });
  });
});