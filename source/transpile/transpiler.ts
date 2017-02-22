export type Transpiler = <R>(module: NodeModule, source: string) => TranspileResult<R>;

export interface TranspileResult<R> {
  source: string;
  module: NodeModule;
  run(): R;
}

export type Preprocessor = (source: string) => string;

export const composePreprocesors = (...preprocessors: Array<Preprocessor>): Preprocessor =>
  (source: string): string => {
    for (const preprocessor of preprocessors) {
      source = preprocessor(source);
    }
    return source;
  };

export interface TranspilationHandler {
  extension: string;
  expression: RegExp;
  preprocessor: Preprocessor;
  transpiler: Transpiler;
  moduleTranslator?: (moduleId: string) => string;
}