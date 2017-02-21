import 'reflect-metadata';

import '../../../transpile/install';

import {Script, createContext} from 'vm';

import {
  dirname,
  join,
  normalize,
} from 'path';

import {Disposable} from '../../../disposable';
import {VirtualMachineException} from '../../../exception';
import {debundleModuleId} from '../../../transpile/debundle';

export class VirtualMachine implements Disposable {
  private scripts = new Map<string, Script>();
  private modules = new Map<string, any>();
  private content = new Map<string, string>();

  private paths = new Set<string>();
  private files = new Set<string>();

  private global = {Reflect};

  sourceCode(filename): string {
    return this.content.get(filename);
  }

  defineModule(filename: string, moduleId: string, source: string) {
    this.defineSource(filename, source);

    const normalizedModuleId = this.normalizeModuleId(moduleId);

    if (this.scripts.has(moduleId) || this.scripts.has(filename)) {
      throw new VirtualMachineException(`Cannot overwrite existing module '${normalizedModuleId}'`);
    }

    const script = new Script(source, {filename, displayErrors: true});

    this.scripts.set(moduleId, script);
    this.scripts.set(normalizedModuleId, script);
    this.scripts.set(filename, script);
  }

  defineSource(filename: string, source: string) {
    filename = normalize(filename);

    this.paths.add(dirname(filename));

    this.files.add(filename);

    this.content.set(filename, source);
  }

  private requireStack = new Array<string>();

  require(moduleId: string, from?: string) {
    if (from) {
      this.requireStack.push(from);
    }

    const normalizedModuleId = this.normalizeModuleId(moduleId);

    let moduleResult = this.readCache(moduleId, normalizedModuleId);
    if (moduleResult === undefined) {
      moduleResult = this.executeWithCache(moduleId, normalizedModuleId);
    }

    if (moduleResult == null) {
      throw new VirtualMachineException(`Require of ${moduleId} (normalized: ${normalizedModuleId}) returned null`);
    }

    return moduleResult;
  }

  executeWithCache(moduleId: string, normalizedModuleId: string) {
    let moduleResult;

    const script = this.scripts.get(normalizedModuleId);
    if (script != null) {
      this.requireStack.push(moduleId);
      try {
        moduleResult = this.executeScript(script, normalizedModuleId);

        this.modules.set(normalizedModuleId, moduleResult);
      }
      finally {
        this.requireStack.pop();
      }
    }
    else {
      moduleResult = require(normalizedModuleId);

      this.modules.set(moduleId, moduleResult);
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
    for (const container of [this.scripts, this.modules, this.content, this.files, this.paths]) {
      container.clear();
    }
  }

  private executeScript(script: Script, moduleId: string) {
    try {
      const exports = {};

      const context = createContext({
        require: mid => this.require(mid),
        exports,
        global: this.global, // shared global object across scripts is important
        module: {exports, id: moduleId},
      });

      script.runInContext(context);

      return exports;
    }
    catch (exception) {
      throw new VirtualMachineException(`Exception in ${moduleId} in sandboxed virtual machine`, exception);
    }
  }

  private readCache(moduleId: string, normalizedModuleId: string) {
    return this.modules.get(normalizedModuleId) || this.modules.get(moduleId);
  }

  normalizeModuleId(to: string): string {
    if (/^\./.test(to)) {
      const stack = this.requireStack;
      if (stack.length > 0) {
        return normalize(join(dirname(stack[stack.length - 1]), to));
      }
    }
    else if (/@angular/.test(to)) {
      return debundleModuleId(to);
    }
    return to;
  }
}
