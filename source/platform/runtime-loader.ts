export abstract class RuntimeModuleLoader {
  abstract load<T>(moduleId: string): Promise<T>;
}
