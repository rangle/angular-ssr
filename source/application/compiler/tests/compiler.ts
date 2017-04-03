import {getApplicationProject} from '../../../test/fixtures';

import {getCompilableProgram} from '../factory';

describe('CompilableProgram', () => {
  it('can build application-basic-inline into executable NgModuleFactory', async () => {
    const program = getCompilableProgram(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'));
    try {
      const module = await program.loadModule({
        source: 'source/test/fixtures/application-basic-inline',
        symbol: 'BasicInlineModule',
      });
      expect(module).not.toBeNull();
      expect(typeof module).toBe('object');
      expect(module.constructor.name).toBe('NgModuleFactory');
    }
    finally {
      program.dispose();
    }
  });

  it('can build application-basic-external into executable NgModuleFactory', async () => {
    const program = getCompilableProgram(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'));
    try {
      const module = await program.loadModule({
        source: 'source/test/fixtures/application-basic-external',
        symbol: 'BasicExternalModule'
      });
      expect(module).not.toBeNull();
      expect(typeof module).toBe('object');
      expect(module.constructor.name).toBe('NgModuleFactory');
    }
    finally {
      program.dispose();
    }
  });

  it('can build application-routed into executable NgModuleFactory', async () => {
    const program = getCompilableProgram(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'));
    try {
      const module = await program.loadModule({
        source: 'source/test/fixtures/application-routed',
        symbol: 'BasicRoutedModule'
      });
      expect(module).not.toBeNull();
      expect(typeof module).toBe('object');
      expect(module.constructor.name).toBe('NgModuleFactory');
    }
    finally {
      program.dispose();
    }
  });
});
