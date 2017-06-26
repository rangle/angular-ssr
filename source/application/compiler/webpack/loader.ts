import {NgModuleFactory} from '@angular/core';

import {join} from 'path';

import {CompilerException} from '../../../exception';
import {ModuleDeclaration, Project} from '../../project';
import {ModuleLoader} from '../loader';

export type Chunk = {name: string, files: Array<string>};

export class WebpackModuleLoader implements ModuleLoader {
  constructor(private project: Project, private chunks: Array<Chunk>) {}

  load<M>(): Promise<NgModuleFactory<M>> {
    return this.lazy<NgModuleFactory<M>>(this.project.applicationModule);
  }

  lazy<T>(module: ModuleDeclaration): Promise<T> {
    const matchingChunk = this.chunks.find(c => c.name === module.source);
    if (matchingChunk == null) {
      throw new CompilerException(`Cannot find a webpack chunk with the name ${module.source}`);
    }

    const js = (matchingChunk.files || []).filter(f => /\.js$/.test(f));
    switch (js.length) {
      case 0: throw new CompilerException(`Chunk ${module.source} does not have associated output files`);
      case 1: break;
      default: throw new CompilerException(`Chunk ${module.source} has more than one JavaScript output: ${js.join(', ')}`);
    }

    const candidate = join(this.project.workingPath.toString(), js[0]);

    const loaded = require(candidate);

    return module.symbol
      ? loaded[module.symbol]
      : loaded;
  }

  dispose() {
    if (this.project.workingPath.equals(this.project.basePath) === false) { // delete outputs
      this.project.workingPath.unlink();
      this.project.workingPath = null;
    }
  }
}