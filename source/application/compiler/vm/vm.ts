import 'reflect-metadata';

import {Script, createContext} from 'vm';

import {dirname, join, normalize} from 'path';

import {Disposable} from '../../../disposable';
import {VirtualMachineException} from '../../../exception';
import {resolveFrom} from '../../../transpile';

export class VirtualMachine implements Disposable {
  private requireStack = new Array<string>();

  private scripts = new Map<string, Script>();
  private modules = new Map<string, any>();
  private content = new Map<string, string>();

  private paths = new Set<string>();

  private sharedContext;

  constructor(private basePath?: string) {
    this.sharedContext = {Reflect};
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

    this.content.set(filename, source);
  }

  require(moduleId: string, from?: string) {
    if (from) {
      this.requireStack.push(from);
    }

    const normalizedModuleId = this.normalizeModuleId(moduleId);

    let moduleResult = this.readCache(moduleId, normalizedModuleId);
    if (moduleResult === undefined) {
      moduleResult = this.readCacheOrExecute(moduleId, normalizedModuleId);
    }

    if (moduleResult == null) {
      throw new VirtualMachineException(`Require of ${moduleId} (normalized: ${normalizedModuleId}) returned null`);
    }

    return moduleResult;
  }

  getSource(filename: string): string {
    return this.content.get(filename);
  }

  directories(from?: string): Set<string> {
    return from
      ? new Set<string>(Array.from(this.paths).filter(d => normalize(dirname(d)) === normalize(from)))
      : this.paths;
  };

  filenames(from?: string): Set<string> {
    const files = Array.from(this.content.keys());
    return from
      ? new Set<string>(Array.from(files).filter(d => normalize(dirname(d)) === normalize(from)))
      : new Set<string>(files);
  }

  dispose() {
    for (const container of [this.scripts, this.modules, this.content, this.paths]) {
      container.clear();
    }
  }

  private readCacheOrExecute(moduleId: string, normalizedModuleId: string) {
    let moduleResult;

    const [mid, script] = this.script(moduleId, normalizedModuleId);
    if (script) {
      moduleResult = this.executeScript(script, mid);
    }
    else {
      moduleResult = require(mid);
    }

    this.modules.set(moduleId, moduleResult);

    return moduleResult;
  }

  private script(...candidates: Array<string>): [string, Script] {
    for (const candidate of candidates) {
      const script = this.scripts.get(candidate);
      if (script) {
        return [candidate, script];
      }
    }
    const match = candidates.find(c => resolveFrom(c, this.basePath) != null);
    if (match) {
      return [match, null];
    }

    const description = JSON.stringify(candidates);

    throw new VirtualMachineException(`No script or file can be resolved (candidates: ${description})`);
  }

  private executeScript(script: Script, moduleId: string) {
    this.requireStack.push(moduleId);

    try {
      const exports = {};

      const context = createContext({
        require: mid => this.require(mid),
        exports,
        global: this.sharedContext,
        module: {exports, id: moduleId},
      });

      script.runInContext(context);

      return exports;
    }
    finally {
      this.requireStack.pop();
    }
  }

  private readCache(moduleId: string, normalizedModuleId: string) {
    return this.modules.get(normalizedModuleId) || this.modules.get(moduleId);
  }

  private normalizeModuleId(to: string): string {
    const stack = this.requireStack;

    return stack.length > 0 && /^\./.test(to)
      ? normalize(join(dirname(stack[stack.length - 1]), to))
      : to;
  }
}
