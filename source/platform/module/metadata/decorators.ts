import {Component, NgModule, Type} from '@angular/core';

import {Reflector} from './reflector';

import {Decorators} from '../../../static';

const annotations = <T>(type: Type<T>): Array<any> => Reflector.annotations(type) || [];

const merge = <T>(decorators: Array<T>): T | null => {
  if (decorators.length === 0) {
    return null;
  }
  return Object.assign({}, ...decorators);
};

export const isInjectable = <T>(type: Type<T>): boolean =>
  annotations(type).some(a => a.toString() === Decorators.injectable);

export const isComponent = <M>(type: Type<M>): boolean =>
  getComponentDecorator(type) != null;

export const isNgModule = <M>(type: Type<M>): boolean =>
  getModuleDecorator(type) != null;

export const getComponentDecorator = <T>(type: Type<T>): Component =>
  merge(Reflector.annotations(type).filter(a => a.toString() === Decorators.component));

export const getModuleDecorator = <M>(type: Type<M>): NgModule =>
  merge(annotations(type).filter(a => a.toString() === Decorators.ngModule));
