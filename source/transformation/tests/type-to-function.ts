import {Injectable} from '@angular/core';

import {typeToInjectorFunction} from '../type-to-function';

describe('typeToInjectorFunction', () => {
  it('instantiates a class decorated with @Injectable()', () => {
    @Injectable()
    class InjectableClass {
      foo() {
        return 1;
      }
    }

    const fn = typeToInjectorFunction(InjectableClass, c => c.foo());
    expect(typeof fn).toBe('function');
    expect(fn.length).toBe(1);

    const executed = fn(null);
    expect(executed).toBe(1);
  });

  it('does not convert functions that are not @Injectable()', () => {
    const fn = typeToInjectorFunction((injector) => 1, c => {throw new Error()});
    expect(typeof fn).toBe('function');
    expect(fn(null)).toBe(1);
  });
});