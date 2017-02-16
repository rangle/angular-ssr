import {VirtualMachine} from '../virtual-machine';

describe('VirtualMachine', () => {
  it('can define multiple sandboxed scripts and execute them', () => {
    const vm = new VirtualMachine();

    vm.define('/foo/m1.js', 'm1', 'module.exports = {foo: function() { return 1; }};');
    vm.define('/foo/m2.js', 'm2', `return require('./m1')`);

    const result = vm.require('./m1');
    expect(result).not.toBeNull();
    expect(result.foo).not.toBeNull();
    expect(typeof result.foo).toBe('function');
    expect(result.foo()).toBe(1);
  });
});