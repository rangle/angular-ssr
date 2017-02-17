import {Script, createContext} from 'vm';

import {dirname, join, normalize} from 'path';

import {Disposable} from 'disposable';

import {VirtualMachineException} from 'exception';

import {transpile} from './transpile';

export class VirtualMachine implements Disposable {
  private scripts = new Map<string, Script>();
  private modules = new Map<string, any>();

  define(filename: string, moduleId: string, code: string) {
    const normalizedModuleId = normalizeModuleId(moduleId);

    if (this.scripts.has(moduleId)) {
      throw new VirtualMachineException(`Cannot overwrite existing module '${normalizedModuleId}'`);
    }

    const preamble = {exports: {}, filename, id: normalizedModuleId};

    const wrappedCode = `(function() {
      const module = ${JSON.stringify(preamble)};
      const exports = module.exports;
      ${code};
      return module.exports;
    })()`;

    const script = new Script(wrappedCode, {filename, displayErrors: true});

    this.scripts.set(moduleId, script);
  }

  require(moduleId: string, relativeTo?: string) {
    const normalizedModuleId = normalizeModuleId(moduleId, relativeTo);

    let moduleResult = this.readCache(moduleId, normalizedModuleId);
    if (moduleResult === undefined) {
      const script = this.scripts.get(normalizedModuleId);
      if (script != null) {
        moduleResult = this.executeScript(script, moduleId, relativeTo);
        this.modules.set(normalizedModuleId, moduleResult);
      }
      else {
        moduleResult = baseRequire(moduleId);
        this.modules.set(moduleId, moduleResult);
      }
    }
    return moduleResult;
  }

  dispose() {
    this.scripts.clear();
    this.modules.clear();
  }

  private executeScript(script: Script, moduleId: string, fromModuleId: string) {
    const context = createContext({require: mid => this.require(mid, fromModuleId)});
    try {
      return script.runInContext(context);
    }
    catch (exception) {
      throw new VirtualMachineException(
        `Exception in ${moduleId} (from ${fromModuleId}) in sandboxed virtual machine: ${exception.stack}`, exception);
    }
  }

  private readCache(moduleId: string, normalizedModuleId: string) {
    return this.modules.get(normalizedModuleId) || this.modules.get(moduleId);
  }
}

const normalizeModuleId = (to: string, from?: string): string => {
  if (to.startsWith('/')) {
    throw new VirtualMachineException(`Cannot resolve a path that starts with /: ${to} (from ${from})`);
  }
  if (from) {
    return normalize(join(dirname(from), to));
  }
  return normalize(to);
};

const baseRequire = (moduleId: string) => {
  console.log('base require', moduleId);

  // For whatever reason, the unbundled JS code in the Angular npm module is compiled into
  // ES2015 code which cannot be run on most NodeJS versions. So for Angular, we transpile
  // using Babel from ES2015 -> ES5 so that we can get broadly-compatible code (like what
  // is in the umd bundles) which we can execute in our VM. Ideally, this hack would not
  // be necessary. Other libraries are just require()d normally without the transpilation
  // because they do not require it and it would be a performance drain.
  if (/^\@angular\//.test(moduleId)) {
    return transpile(moduleId);
  }
  return require(moduleId);
};