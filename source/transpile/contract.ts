export type Transpiler = (module: NodeModule, source: string) => string;

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
