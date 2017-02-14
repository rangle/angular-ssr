import {existsSync, readFileSync} from 'fs';

import {ResourceLoader} from '@angular/compiler';

import {ResourceException} from './exception';

export class ResourceLoaderImpl implements ResourceLoader {
  async get(uri: string): Promise<string> {
    if (existsSync(uri) === false) {
      throw new ResourceException(`Nonexistent resource attempted to load: ${uri}`);
    }

    const content = readFileSync(uri, 'utf8').toString();

    return Promise.resolve(content);
  }
}
