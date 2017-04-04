import {ModuleResolutionHostAdapter} from '@angular/compiler-cli';

import {CompilerHost} from 'typescript';

export class ResourceResolver extends ModuleResolutionHostAdapter {
  constructor(private compilerHost: CompilerHost) {
    super(compilerHost);
  }

  readResource(s: string): Promise<string> {
    try {
      if (this.compilerHost.fileExists(s)) {
        return Promise.resolve(this.compilerHost.readFile(s));
      }
      return Promise.resolve(require(s));
    }
    catch (e) {}

    return super.readResource(s);
  }
}
