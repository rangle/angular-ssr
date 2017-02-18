import 'reflect-metadata';

import {Script, createContext} from 'vm';

import {dirname, join, normalize} from 'path';

import {Disposable} from 'disposable';

import {VirtualMachineException} from 'exception';

import {transpile} from './transpile';

export class VirtualMachine implements Disposable {
  private scripts = new Map<string, [Script, string]>();
  private modules = new Map<string, any>();

  private paths = new Set<string>();
  private files = new Set<string>();

  private fileContents = new Map<string, string>();

  private global = {Reflect};

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

    const script = new Script(code, {filename, displayErrors: true});

    this.scripts.set(moduleId, [script, filename]);
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
          const [executable, filename] = script;
          moduleResult = this.executeScript(executable, filename, normalizedModuleId);

          this.modules.set(normalizedModuleId, moduleResult);
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

    if (moduleResult == null) {
      throw new VirtualMachineException(`Require of ${moduleId} (normalized: ${normalizedModuleId}) returned null`);
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

  private executeScript(script: Script, filename: string, moduleId: string) {
    try {
      const exports = {};

      const context = createContext({
        require: mid => this.require(mid),
        exports,
        global: this.global,
        module: {exports, filename, id: moduleId},
        __filename: filename,
        __dirname: dirname(filename),
      });

      script.runInContext(context);

      return exports;
    }
    catch (exception) {
      throw new VirtualMachineException(
        `Exception in ${moduleId} in sandboxed virtual machine: ${exception.toString()}`, exception);
    }
  }

  private readCache(moduleId: string, normalizedModuleId: string) {
    return this.modules.get(normalizedModuleId) || this.modules.get(moduleId);
  }

  normalizeModuleId(to: string): string {
    if (/^\./.test(to)) {
      const stack = this.requireStack;
      if (stack.length > 0) {
        return join(dirname(stack[stack.length - 1]), to);
      }
    }

    return to;
  }

  private conditionalTranspile(moduleId: string) {
    if (/^@angular/.test(moduleId)) {
      const [path, code] = transpile(moduleId);
      this.define(path, moduleId, code);
      return this.require(moduleId);
    }

    return require(moduleId);
  }
}
