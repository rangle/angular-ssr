import {Program} from 'typescript';

// This class does inplace transformation of the TypeScript syntax tree. There are several
// bits of functionality that require deep inspection of the target application, or
// transformations like changing import statements to use Angular bundles instead of deep
// importing into src (like generated NgFactory files do).
export abstract class Refactor {
    static importSourceToImportBundle(program: Program) {
      // TODO(cbond): Implement
    }

    static adjustModuleImports(program: Program) {
      // TODO(cbond): Implement
    }
}