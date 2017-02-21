import {VirtualMachine} from '../vm';

describe('VirtualMachine', () => {
  const vmexec = (fn: (vm: VirtualMachine) => void | Promise<void>) => {
    const vm = new VirtualMachine();
    try {
      return fn(vm);
    }
    finally {
      vm.dispose();
    }
  };

  it('can execute a basic script in a separate VM', () => {
    vmexec(vm => {
      vm.defineModule('/foo.js', 'foo', 'exports.foo = 0');

      const result = vm.require('foo');
      expect(result).not.toBeNull();
      expect(result.foo).toBe(0);
    });
  });

  it('can provide a virtualized require() that can require other scripts defined in the VM', () => {
    vmexec(vm => {
      vm.defineModule('/foo/m1.js', 'm1', 'exports.foo = function() { return 1; }');
      vm.defineModule('/foo/m2.js', 'm2', `exports.bar = require('./m1').foo`);

      const result = vm.require('m2');
      expect(result).not.toBeNull();
      expect(result.bar).not.toBeNull();
      expect(typeof result.bar).toBe('function');

      const invokeResult = result.bar(); // imported from m1
      expect(invokeResult).toBe(1);
    });
  });

  it('can include third party libraries through virtualized require()', () => {
    vmexec(vm => {
      vm.defineModule('/foo.js', 'foo', 'exports.c = require("@angular/core")');

      const m = vm.require('foo');
      expect(m.c).not.toBeNull();
      expect(m.c.createPlatform).not.toBeNull();
    });
  });
});