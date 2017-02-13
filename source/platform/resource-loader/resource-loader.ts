import {ResourceLoader} from '@angular/compiler';

export class ResourceLoaderImpl implements ResourceLoader {
  get(url: string): Promise<string> {
    return Promise.reject(new Error('Not implemented'));
  }
}
