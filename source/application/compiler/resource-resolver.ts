import {ModuleResolutionHostAdapter} from '@angular/compiler-cli';

import {CompilerHost} from 'typescript';

import {basename, dirname} from 'path';

export class ResourceResolver extends ModuleResolutionHostAdapter {
  constructor(private compilerHost: CompilerHost) {
    super(compilerHost);
  }

  readResource(s: string): Promise<string> {
    try {
      if (this.compilerHost.fileExists(s)) {
        return Promise.resolve(this.compilerHost.readFile(s));
      }

      const candidates = [
        s,
        `${s}.css`,
        `${s}.scss`,
        `${s}.sass`,
        `${dirname(s)}/_${basename(s)}`,
        `${dirname(s)}/_${basename(s)}.css`,
        `${dirname(s)}/_${basename(s)}.scss`,
        `${dirname(s)}/_${basename(s)}.sass`,
      ];

      for (const candidate of candidates) {
        try {
          return Promise.resolve(require(candidate));
        }
        catch (exception) {}
      }
    }
    catch (e) {}

    return super.readResource(s);
  }
}
