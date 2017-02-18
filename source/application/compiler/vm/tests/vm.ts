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
      vm.define('/foo.js', 'foo', 'return 0');

      const result = vm.require('foo');
      expect(result).not.toBeNull();
      expect(result).toBe(0);
    });
  });

  it('can provide a virtualized require() that can require other scripts defined in the VM', () => {
    vmexec(vm => {
      vm.define('/foo/m1.js', 'm1', 'exports.foo = function() { return 1; }');
      vm.define('/foo/m2.js', 'm2', `return require('./m1')`);

      const result = vm.require('./m1');
      expect(result).not.toBeNull();
      expect(result.foo).not.toBeNull();
      expect(typeof result.foo).toBe('function');

      const invokeResult = result.foo(); // imported from m1
      expect(invokeResult).toBe(1);
    });
  });

  it('can include third party libraries through virtualized require()', () => {
    vmexec(vm => {
      vm.define('/foo.js', 'foo', 'return require("@angular/core")');

      const core = vm.require('foo');
      expect(core).not.toBeNull();
      expect(core.createPlatform).not.toBeNull();
    });
  });
});