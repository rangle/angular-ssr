import {ModuleLoader} from '../../loader';

import {NgcCompiler} from '../compiler';

import {getApplicationProject} from '../../../../test/fixtures';

describe('NgcCompiler', () => {
  let loader: ModuleLoader;

  beforeAll(async () => {
    const compiler = new NgcCompiler(getApplicationProject('source/test/fixtures/application-basic-external', 'BasicExternalModule'));

    loader = await compiler.compile();
  });

  afterAll(() => loader.dispose());

  it('can build a basic application with external templates into executable NgModuleFactory', async () => {
    const module = await loader.lazy({source: 'source/test/fixtures/application-basic-external', symbol: 'BasicExternalModule'});
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(/NgModuleFactory/.test(module.constructor.name)).toBeTruthy();
  });

  it('can build application with lazy routes into executable NgModuleFactory', async () => {
    const module = await loader.lazy({source: 'source/test/fixtures/application-routed', symbol: 'BasicRoutedModule'});
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(/NgModuleFactory/.test(module.constructor.name)).toBeTruthy();
  });

  afterEach(() => {
    if (typeof gc === 'function') {
      gc();
    }
  });
});

declare const gc: () => void;
