import {dirname, join, normalize} from 'path';

import {Disposable} from '../../../disposable';

import {
  Module,
  ModuleExports,
  compile
} from '../../../transpile';

const modules = new Map<string, ModuleExports>();

export class ExecutionContext implements Disposable {
  constructor(private basePath?: string) {}

  private executionStack = new Array<string>();

  private scripts = new Map<string, string>();

  private content = new Map<string, string>();

  private paths = new Set<string>();

  module(filename: string, moduleId: string, source: string) {
    this.source(filename, source);

    const candidates = [filename, ...this.moduleCandidates(null, moduleId)];

    for (const key of candidates) {
      this.scripts.set(key, source);
    }
  }

  source(filename: string, source?: string) {
    filename = normalize(filename);
    if (source != null) {
      this.paths.add(dirname(filename));

      this.content.set(filename, source);

      return source;
    }
    else {
      return this.content.get(filename);
    }
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

  require(moduleId: string, from?: string): ModuleExports {
    const candidates = this.moduleCandidates(from, moduleId);

    const [mid, script] = this.script(moduleId, candidates);

    let moduleResult = modules.get(mid);
    if (moduleResult) {
      return moduleResult;
    }

    this.executionStack.push(moduleId);
    try {
      if (script) {
        const syntheticModule = Module.nodeModule(m => this.require(m, mid), mid, {});

        modules.set(mid, syntheticModule.exports);

        compile(syntheticModule, script);

        moduleResult = syntheticModule.exports;
      }
      else {
        moduleResult = require(mid);

        modules.set(mid, moduleResult);
      }

      return moduleResult;
    }
    finally {
      this.executionStack.pop();
    }
  }

  reset() {
    for (const container of [this.scripts, this.content, this.paths]) {
      container.clear();
    }
  }

  dispose() {
    this.reset();
  }

  private script(moduleId: string, candidates: Array<string>): [string, string] {
    for (const c of candidates) {
      let script = this.scripts.get(c);
      if (script) {
        return [c, script];
      }

      const module = Module.relativeResolve(c, moduleId);
      if (module) {
        return [module, null];
      }
    }

    const module = Module.relativeResolve(this.basePath, moduleId);
    if (module) {
      return [module, null];
    }

    return [moduleId, null]
  }

  private moduleCandidates(from: string, to: string): Array<string> {
    const candidates = new Array<string>(to, normalize(to));

    const stack = this.executionStack;

    if (/^\./.test(to)) {
      if (from) {
        candidates.push(normalize(join(from, to)));
        candidates.push(normalize(join(dirname(from), to)));
      }
      if (this.basePath) {
        candidates.push(normalize(join(this.basePath, to)));
      }
      if (stack.length > 0) {
        candidates.push(normalize(join(dirname(stack[stack.length - 1]), to)));
      }
    }

    return candidates;
  }
}
