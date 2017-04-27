import {getApplicationProject} from '../../../../test/fixtures';
import {NgcCompiler} from '../compiler';

describe('NgcCompiler > external', () => {
  it('can build application into executable NgModuleFactory', async () => {
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
});
