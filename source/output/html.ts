import {join} from 'path';

import {Logger} from 'scoped-logger';

import {Author} from './author';
import {OutputException} from '../exception';
import {PathReference, fileFromString, pathFromString} from '../filesystem';
import {Snapshot} from '../snapshot';
import {Route, routeToPath} from '../route';
import {htmlRoot} from '../identifiers';

export class HtmlOutput extends Author {
  constructor(private logger: Logger, public path: PathReference) {
    super();
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
