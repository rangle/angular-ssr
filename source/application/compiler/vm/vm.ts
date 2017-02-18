import {Context, Script, createContext} from 'vm';

import {dirname, join, normalize} from 'path';

import {Disposable} from 'disposable';

import {VirtualMachineException} from 'exception';

import {transpile} from './transpile';

export class VirtualMachine implements Disposable {
  private scripts = new Map<string, Script>();
  private modules = new Map<string, any>();

  private paths = new Set<string>();
  private files = new Set<string>();

  private fileContents = new Map<string, string>();

  private context: Context;

  constructor() {
    this.context = createContext({global, require: mid => this.require(mid)});
  }

  read(filename): string {
    return this.fileContents.get(filename);
  }

  define(filename: string, moduleId: string, code: string) {
    this.paths.add(normalize(dirname(filename)));
    this.files.add(normalize(filename));

    this.fileContents.set(filename, code);

    const normalizedModuleId = this.normalizeModuleId(moduleId);

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

  private requireStack = new Array<string>();

  require(moduleId: string, from?: string) {
    if (from) {
      this.requireStack.push(from);
    }

    const normalizedModuleId = this.normalizeModuleId(moduleId);

    let moduleResult = this.readCache(moduleId, normalizedModuleId);
    if (moduleResult === undefined) {
      const script = this.scripts.get(normalizedModuleId);
      if (script != null) {
        this.requireStack.push(moduleId);
        try {
          this.modules.set(normalizedModuleId, this.executeScript(script, moduleId));
        }
        finally {
          this.requireStack.pop();
        }
      }
      else {
        moduleResult = this.conditionalTranspile(normalizedModuleId);
        this.modules.set(moduleId, moduleResult);
      }
    }
    return moduleResult;
  }

  directories(from?: string): Set<string> {
    return from
      ? new Set<string>(Array.from(this.paths).filter(d => normalize(dirname(d)) === normalize(from)))
      : this.paths;
  };

  filenames(from?: string): Set<string> {
    return from
      ? new Set<string>(Array.from(this.files).filter(d => normalize(dirname(d)) === normalize(from)))
      : this.files;
  }

  dispose() {
    this.scripts.clear();
    this.modules.clear();
  }

  private executeScript(script: Script, moduleId: string) {
    try {
      return script.runInContext(this.context);
    }
    catch (exception) {
      throw new VirtualMachineException(
        `Exception in ${moduleId} in sandboxed virtual machine: ${exception.stack}`, exception);
    }
  }

  private readCache(moduleId: string, normalizedModuleId: string) {
    return this.modules.get(normalizedModuleId) || this.modules.get(moduleId);
  }

  normalizeModuleId(to: string): string {
    const stack = this.requireStack;

    if (/^\./.test(to)) {
      if (this.requireStack.length > 0) {
        return join(dirname(stack[stack.length - 1]), to);
      }
      else {
        throw new VirtualMachineException(
          `Cannot determine relative path to ${to} (require stack: ${stack.join(' -> ')})`);
      }
    }
    return to;
  }

  private conditionalTranspile(moduleId: string) {
    if (/^\@angular/.test(moduleId)) {
      const [path, code] = transpile(moduleId);
      this.define(path, moduleId, code);
      return this.require(moduleId);
    }
    return require(moduleId);
  }
}
