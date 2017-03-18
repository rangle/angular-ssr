import {Injectable} from '@angular/core';

@Injectable()
export abstract class RuntimeModuleLoader {
  abstract load<T>(moduleId: string): Promise<T>;
}
