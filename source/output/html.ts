import chalk = require('chalk');

import {join} from 'path';

import {Files} from '../static';
import {OutputOptions} from './options';
import {OutputProducer} from './producer';
import {OutputException} from '../exception';
import {fileFromString, pathFromString} from '../filesystem';
import {Snapshot} from '../snapshot';
import {log} from './log';
import {pathFromUri} from '../route';
import {transformInplace} from './transform';

export class HtmlOutput implements OutputProducer {
  constructor(private options: OutputOptions) {}

  initialize() {
    if (this.options.output == null) {
      throw new OutputException('HTML output writer needs a path to write to');
    }

    if (this.options.output.exists() === false) {
      try {
        this.options.output.mkdir();
      }
      catch (exception) {
        throw new OutputException(`Cannot create output folder: ${this.options.output.toString()}`, exception);
      }

      log.info(`Created output path: ${this.options.output.toString()}`);
    }

    return Promise.resolve();
  }

  async write<V>(snapshot: Snapshot<V>): Promise<void> {
    const file = fileFromString(join(this.routedPathFromSnapshot(snapshot).toString(), Files.index));

    transformInplace(file.parent(), snapshot, this.options);

    log.info(`Rendered route ${pathFromUri(snapshot.uri)} to ${file}`);

    file.create(snapshot.renderedDocument);

    return Promise.resolve(void 0);
  }

  exception(exception: Error) {
    log.error(`Fatal exception encountered: ${chalk.red(exception.toString())}`);

    return Promise.resolve(void 0);
  }

  private routedPathFromSnapshot<V>(snapshot: Snapshot<V>) {
    const routedPath = pathFromString(join(this.options.output.toString(), pathFromUri(snapshot.uri)));

    routedPath.mkdir();

    return routedPath;
  }
}
