import {ExecutionContext} from '../execution-context';

describe('execution context', () => {
  it('can execute a basic script', () => {
    const context = new ExecutionContext();
    try {
      context.module('/foo.js', 'foo', 'exports.foo = 0');

      const result = context.require('foo');
      expect(result).not.toBeNull();
      expect(result['foo']).toBe(0);
    }
    finally {
      context.dispose();
    }
  });

  it('can provide a virtualized require() that can require in-memory scripts', () => {
    const context = new ExecutionContext();
    try {
      context.module('/foo/m1.js', 'm1', 'exports.foo = function() { return 1; }');
      context.module('/foo/m2.js', 'm2', `exports.bar = require('m1').foo`);

      const result = context.require('m2');
      expect(result).not.toBeNull();
      expect(result['bar']).not.toBeNull();
      expect(typeof result['bar']).toBe('function');

      const invokeResult = result['bar'](); // imported from m1
      expect(invokeResult).toBe(1);
    }
    finally {
      context.dispose();
    }
  });

  it('can include third party libraries through virtualized require()', () => {
    const context = new ExecutionContext();
    try {
      context.module('/foo.js', 'foo', 'Object.assign(exports, require("@angular/core"))');

      const m = context.require('foo');
      expect(m).not.toBeNull();
      expect(m['createPlatform']).not.toBeNull();
    }
    finally {
      context.dispose();
    }
  });
});