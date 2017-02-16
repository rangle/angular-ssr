import {Script, createContext} from 'vm';

import {dirname, join, normalize} from 'path';

import {Disposable} from 'disposable';

import {VirtualMachineException} from 'exception';

export class VirtualMachine implements Disposable {
  private scripts = new Map<string, Script>();
  private modules = new Map<string, any>();

  define(filename: string, moduleId: string, code: string) {
    if (moduleId.startsWith('/') ||
        moduleId.startsWith('.')) {
      throw new VirtualMachineException(`Invalid module ID: ${moduleId}`);
    }

    if (this.scripts.has(moduleId)) {
      throw new VirtualMachineException(`Cannot overwrite existing module ${moduleId}`);
    }

    const wrappedCode = `(function() {
      const module = {id: '${moduleId}', exports: {}, filename: '${filename}'};
      const exports = module.exports;
      ${code};
      return exports;
    })()`;

    const script = new Script(wrappedCode, {filename, displayErrors: true});

    this.scripts.set(moduleId, script);
  }

  require(moduleId: string, relativeTo?: string) {
    const absolutePath = this.resolvePath(moduleId, relativeTo);

    if (this.modules.has(absolutePath) === false) {
      const script = this.scripts.get(absolutePath);
      if (script == null) {
        return require(moduleId); // probably a third-party module
      }

      const context = createContext({require: mid => this.require(mid, moduleId)});

      try {
        this.modules.set(moduleId, script.runInContext(context));
      }
      catch (exception) {
        throw new VirtualMachineException(`Failure to execute ${moduleId} in VM: ${exception.stack}`, exception);
      }
    }

    return this.modules.get(moduleId);
  }

  dispose() {
    this.scripts.clear();
    this.modules.clear();
  }

  private resolvePath(to: string, from: string) {
    if (to.startsWith('/')) {
      throw new VirtualMachineException(`Cannot resolve a path that starts with /: ${to} (from ${from})`);
    }
    if (from) {
      return normalize(join(dirname(from), to));
    }
    return normalize(to);
  }
}