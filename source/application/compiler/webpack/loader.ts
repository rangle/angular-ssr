import {NgModuleFactory} from '@angular/core';

import {join} from 'path';

import {CompilerException} from '../../../exception';
import {ModuleDeclaration, Project} from './../../project';
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

    if (matchingChunk.files == null ||
        matchingChunk.files.length !== 1) {
      throw new CompilerException(`Chunk ${module.source} does not have associated output files`);
    }

    const candidate = join(this.project.workingPath.toString(), matchingChunk.files[0]);

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