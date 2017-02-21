import {getApplicationProject} from 'test-fixtures';

import {Compiler} from '../compiler';

describe('in-memory Angular compiler', () => {
  it('can build application-basic-inline in memory return executable NgModuleFactory', async () => {
    const compiler = new Compiler(getApplicationProject('test-fixtures/application-basic-inline', 'BasicInlineModule'));
    const module = await compiler.compile();
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module.constructor.name).toBe('NgModuleFactory');
  });

  it('can build application-basic-external in memory return executable NgModuleFactory', async () => {
    const compiler = new Compiler(getApplicationProject('test-fixtures/application-basic-external', 'BasicExternalModule'));
    const module = await compiler.compile();
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module.constructor.name).toBe('NgModuleFactory');
  });

  it('can build application-routed in memory return executable NgModuleFactory', async () => {
    const compiler = new Compiler(getApplicationProject('test-fixtures/application-routed', 'BasicRoutedModule'));
    const module = await compiler.compile();
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module.constructor.name).toBe('NgModuleFactory');
  });
});
