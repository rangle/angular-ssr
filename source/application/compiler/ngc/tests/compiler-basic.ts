import {getApplicationProject} from '../../../../test/fixtures';
import {NgcCompiler} from '../compiler';

xdescribe('NgcCompiler > basic', () => {
  it('can build application into executable NgModuleFactory', async () => {
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
});
