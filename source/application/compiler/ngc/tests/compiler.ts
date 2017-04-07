import {getApplicationProject} from '../../../../test/fixtures';
import {NgcCompiler} from '../compiler';

describe('CompilableProgram', () => {
  it('can build application-basic-inline into executable NgModuleFactory', async () => {
    const program = new NgcCompiler(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'));

    const loader = await program.compile();
    try {
      const module = await loader.load();
      expect(module).not.toBeNull();
      expect(typeof module).toBe('object');
      expect(module.constructor.name).toBe('NgModuleFactory');
    }
    finally {
      loader.dispose();
    }
  });

  it('can build application-basic-external into executable NgModuleFactory', async () => {
    const compiler = new NgcCompiler(getApplicationProject('source/test/fixtures/application-basic-external', 'BasicExternalModule'));

    const loader = await compiler.compile();
    try {
      const module = await loader.load();
      expect(module).not.toBeNull();
      expect(typeof module).toBe('object');
      expect(module.constructor.name).toBe('NgModuleFactory');
    }
    finally {
      loader.dispose();
    }
  });

  it('can build application-routed into executable NgModuleFactory', async () => {
    const compiler = new NgcCompiler(getApplicationProject('source/test/fixtures/application-routed', 'BasicRoutedModule'));

    const loader = await compiler.compile();
    try {
      const module = await loader.load();
      expect(module).not.toBeNull();
      expect(typeof module).toBe('object');
      expect(module.constructor.name).toBe('NgModuleFactory');
    }
    finally {
      loader.dispose();
    }
  });
});
