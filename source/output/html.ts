import {join} from 'path';

import {Logger} from 'scoped-logger';

import {Output} from './output';
import {OutputException} from '../exception';
import {PathReference, fileFromString, pathFromString} from '../filesystem';
import {Snapshot} from '../snapshot';
import {Route, routeToPath} from '../route';
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

    const routedPath = pathFromString(this.routeToPath(snapshot.route));
    routedPath.mkdir();

    const file = fileFromString(join(routedPath.toString(), htmlRoot));

    this.logger.info(`Writing rendered route ${routeToPathDescription(snapshot.route)} to ${file}`);

    file.create(snapshot.renderedDocument);
  }

  private routeToPath(route: Route): string {
    return join(this.path.toString(), routeToPath(route));
  }
}

const routeToPathDescription = (route: Route): string => `/${routeToPath(route)}`;
