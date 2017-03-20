import {join} from 'path';

import {Logger} from 'scoped-logger';

import {Output} from './output';
import {OutputException} from '../exception';
import {PathReference, fileFromString, pathFromString} from '../filesystem';
import {Snapshot} from '../snapshot';
import {pathFromUri} from '../route';
import {htmlRoot} from '../identifiers';
import {logger as baseLogger} from './logger';

export class HtmlOutput extends Output {
  constructor(public path: PathReference, private logger?: Logger) {
    super();

    this.logger = logger || baseLogger;
  }

  initialize(): Promise<void> {
    if (this.path == null) {
      throw new OutputException('HTML output writer needs a path to write to');
    }

    if (this.path.exists() === false) {
      this.logger.info(`Creating output path: ${this.path}`);

      this.path.mkdir();
    }

    return Promise.resolve();
  }

  async write<V>(snapshot: Snapshot<V>): Promise<void> {
    this.assertValid(snapshot);

    const path = pathFromUri(snapshot.uri);

    const routedPath = pathFromString(path);
    routedPath.mkdir();

    const file = fileFromString(join(routedPath.toString(), htmlRoot));

    this.logger.info(`Writing rendered route /${path} to ${file}`);

    file.create(snapshot.renderedDocument);
  }
}
