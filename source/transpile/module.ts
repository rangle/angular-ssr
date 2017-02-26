import {dirname, join} from 'path';

import {ModuleException} from '../exception';

import {debundleImport} from '../transpile';

import {
  FileReference,
  FileType,
  PathReference,
  pathFromString
} from '../filesystem';

const ModuleImpl = require('module');

export abstract class Module {
  static compile(module: NodeModule, source: string) {
    ModuleImpl.prototype._compile.call(module, source, module.filename);
  }

  static externalModuleRoots(...fromPaths: Array<string | FileReference | PathReference>): Array<string> {
    const result = new Set<string>();

    for (const path of fromPaths.map(element => elementToDirectory(element))) {
      for (const p of ModuleImpl._nodeModulePaths(path)) {
        result.add(p);
      }
    }

    return Array.from(result);
  }

  static relativeResolve(fromPath: string, moduleId: string): string {
    moduleId = debundleImport(moduleId);

    let resolved = resolveFromRoot(moduleId);
    if (resolved || fromPath == null) {
      return resolved;
    }

    try {
      const path = pathFromString(fromPath || dirname(moduleId));

      const paths = Module.externalModuleRoots(path, moduleId);

      const filename = join(path.toString(), 'placeholder.js');

      const options = {id: filename, filename: filename, paths};

      return ModuleImpl._resolveFilename(moduleId, options);
    }
    catch (exception) {
      return null;
    }
  }

  static nodeModule(require: (m: string) => ModuleExports, moduleId: string, exports: ModuleExports): NodeModule {
    return <NodeModule> {
      id: moduleId,
      filename: `${moduleId}.js`,
      require,
      exports,
      loaded: false,
      parent: null,
      children: [],
    };
  }
};

const resolveFromRoot = (moduleId: string): string => {
  try {
    return require.resolve(moduleId);
  }
  catch (exception) {
    return null;
  }
};

export type ModuleExports = {[index: string]: any};

export interface ModuleFunction {
  (exports, require: NodeRequireFunction, module: NodeModule, __filename: string, __dirname: string,): void;
}

const elementToDirectory = (element: string | PathReference | FileReference): string => {
  if (typeof element === 'string') {
    return element;
  }

  const type = element.type();
  if (type.is(FileType.File)) {
    return element.parent().toString();
  }
  else if (type.is(FileType.Directory)) {
    return element.toString();
  }

  throw new ModuleException(`Cannot determine modules path for ${element} of type ${type.description()}`);
};