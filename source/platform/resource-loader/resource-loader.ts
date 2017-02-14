import {ResourceLoader} from '@angular/compiler';

import {ResourceException} from './exception';

export class ResourceLoaderImpl implements ResourceLoader {
  async get(url: string): Promise<string> {
    throw new ResourceException('Not implemented');
  }
}
