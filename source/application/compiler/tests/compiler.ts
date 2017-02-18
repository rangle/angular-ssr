import {NgModuleFactory} from '@angular/core';

import {getApplicationProject} from 'test-fixtures';

import {Compiler} from '../compiler';

describe('Compiler', () => {
  it('should be able to build a TypeScript application and produce in-memory artifacts', async () => {
    const compiler =
      new Compiler(
        getApplicationProject(
          'test-fixtures/application-basic-inline',
          'BasicInlineApplication'));

    const module = await compiler.compile();
    expect(module).not.toBeNull();
    expect(typeof module).toBe('object');
    expect(module instanceof NgModuleFactory).toBe(true);
    expect((<{name?}>module).name).toBe('BasicInlineApplicationNgFactory');
  });
});
