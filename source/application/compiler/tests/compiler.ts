import {dirname} from 'path';

import {filesystemSearchUpward} from 'test-fixtures';

import {Compiler} from '../compiler';

describe('Compiler', () => {
  const createCompiler = () => {
    const tsconfig = filesystemSearchUpward(__dirname, 'tsconfig.json');

    return new Compiler({
      basePath: dirname(tsconfig),
      ngModule: ['test-fixtures/application-basic-inline.ts', 'BasicInlineApplication'],
      tsconfig,
    });
  };

  xit('should be able to build a TypeScript application and produce in-memory artifacts', async () => {
    const compiler = createCompiler();
    const bundle = await compiler.compile();
    expect(bundle).not.toBeNull();
  });
});
