import {dirname, join, normalize} from 'path';

import {Disposable} from '../../../disposable';

import {
  Module,
  ModuleExports,
  compile
} from '../../../transpile';

const modules = new Map<string, ModuleExports>();

export class VirtualMachine implements Disposable {
  constructor(private basePath?: string) {}

  private executionStack = new Array<string>();
  private scripts = new Map<string, string>();
  private content = new Map<string, string>();
  private paths = new Set<string>();

  require(moduleId: string, from?: string): ModuleExports {
    this.executionStack.push(moduleId);

    try {
      let moduleResult = modules.get(moduleId);
      if (moduleResult) {
        return moduleResult;
      }

      const candidates = this.moduleCandidates(from, moduleId);

      const [mid, script] = this.script(moduleId, candidates);
      if (script) {
        const module = Module.nodeModule(m => this.require(m, mid), moduleId, {});

        compile(module, script);

        moduleResult = module.exports;
      }
      else {
        moduleResult = require(mid);
      }

      modules.set(moduleId, moduleResult);

      return moduleResult;
    }
    finally {
      this.executionStack.pop();
    }
  }

  defineModule(filename: string, moduleId: string, source: string) {
    this.defineSource(filename, source);

    const candidates = [filename, ...this.moduleCandidates(null, moduleId)];

    for (const key of candidates) {
      this.scripts.set(key, source);
    }
  }

  defineSource(filename: string, source: string) {
    filename = normalize(filename);

    this.paths.add(dirname(filename));

    this.content.set(filename, source);
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
    for (const container of [this.scripts, this.content, this.paths]) {
      container.clear();
    }
  }

  private script(moduleId: string, candidates: Array<string>): [string, string] {
    for (const c of candidates) {
      let script = this.scripts.get(c);
      if (script) {
        return [c, script];
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
