import chalk = require('chalk');

import {join} from 'path';

import {Files} from '../static';
import {OutputProducer} from './producer';
import {OutputException} from '../exception';
import {PathReference, fileFromString, pathFromString} from '../filesystem';
import {Snapshot} from '../snapshot';
import {inlineResources} from './inline';
import {log} from './log';
import {pathFromUri} from '../route';

export class HtmlOutput implements OutputProducer {
  private path: PathReference;

  constructor(path: PathReference | string, private inline: boolean = true) {
    this.path = pathFromString(path);
  }

  initialize() {
    if (this.path == null) {
      throw new OutputException('HTML output writer needs a path to write to');
    }

    if (this.path.exists() === false) {
      try {
        this.path.mkdir();
      }
      catch (exception) {
        throw new OutputException(`Cannot create output folder: ${this.path}`, exception);
      }

      log.info(`Created output path: ${this.path}`);
    }

    return Promise.resolve();
  }

  async write<V>(snapshot: Snapshot<V>): Promise<void> {
    const file = fileFromString(join(this.routedPathFromSnapshot(snapshot).toString(), Files.index));

    const rendered = this.inline
      ? inlineResources(file.parent(), snapshot.renderedDocument)
      : snapshot.renderedDocument;

    log.info(`Rendered route ${pathFromUri(snapshot.uri)} to ${file}`);

    file.create(rendered);

    return Promise.resolve(void 0);
  }

  exception(exception: Error) {
    log.error(`Fatal exception encountered: ${chalk.red(exception.toString())}`);

    return Promise.resolve(void 0);
  }

  private routedPathFromSnapshot<V>(snapshot: Snapshot<V>) {
    const routedPath = pathFromString(join(this.path.toString(), pathFromUri(snapshot.uri)));

    routedPath.mkdir();

    return routedPath;
  }
}
