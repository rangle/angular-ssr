import {getApplicationProject} from '../../../test/fixtures';

import {getCompilableProgram} from '../factory';

import {CompilableProgram} from '../program';

describe('program compilation', () => {
  let program: CompilableProgram;

  beforeAll(() => {
    const baseProject = getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule');
    program = getCompilableProgram(baseProject);
  });

  it('can build application-basic-inline in memory return executable NgModuleFactory', async () => {
    const project = getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule');
    const module = await program.loadModule(project.applicationModule);
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module.constructor.name).toBe('NgModuleFactory');
  });

  it('can build application-basic-external in memory return executable NgModuleFactory', async () => {
    const project = getApplicationProject('source/test/fixtures/application-basic-external', 'BasicExternalModule');
    const module = await program.loadModule(project.applicationModule);
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module.constructor.name).toBe('NgModuleFactory');
  });

  it('can build application-routed in memory return executable NgModuleFactory', async () => {
    const project = getApplicationProject('source/test/fixtures/application-routed', 'BasicRoutedModule');
    const module = await program.loadModule(project.applicationModule);
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module.constructor.name).toBe('NgModuleFactory');
  });
});
