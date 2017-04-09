import {join} from 'path';

import {Logger} from 'scoped-logger';

import {Files} from '../static';
import {OutputProducer} from './producer';
import {OutputException} from '../exception';
import {PathReference, fileFromString, pathFromString} from '../filesystem';
import {Snapshot, assertSnapshot} from '../snapshot';
import {log} from './log';
import {pathFromUri} from '../route';

export class HtmlOutput implements OutputProducer {
  private path: PathReference;

  constructor(path: PathReference | string, private logger: Logger = log) {
    this.path = pathFromString(path);
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
    assertSnapshot(snapshot);

    const file = fileFromString(join(this.routedPathFromSnapshot(snapshot).toString(), Files.index));

    this.logger.info(`Rendered route ${pathFromUri(snapshot.uri)} to ${file} `);

    file.create(snapshot.renderedDocument);

    return Promise.resolve(void 0);
  }

  exception(exception: Error) {
    this.logger.error(`Fatal exception encountered: ${exception.toString()}`);
  }

  private routedPathFromSnapshot<V>(snapshot: Snapshot<V>) {
    const routedPath = pathFromString(join(this.path.toString(), pathFromUri(snapshot.uri)));

    routedPath.mkdir();

    return routedPath;
  }
}
