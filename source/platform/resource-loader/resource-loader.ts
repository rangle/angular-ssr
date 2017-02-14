import {existsSync, readFileSync} from 'fs';

import {join, resolve} from 'path';

import {ResourceLoader} from '@angular/compiler';

import {ResourceException} from './exception';

export class ResourceLoaderImpl implements ResourceLoader {
  async get(uri: string): Promise<string> {
    const path = resolve(join(process.cwd(), ...uri.split('/')));

    if (existsSync(path) === false) {
      throw new ResourceException(`Nonexistent resource attempted to load: ${uri}`);
    }

    const content = readFileSync(path, 'utf8').toString();

    return Promise.resolve(content);
  }
}
