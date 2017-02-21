import {argv, cwd} from 'process';

import * as minimist from 'minimist';

import {Project} from 'application';
import {PathException} from 'exception';
import {Path, pathFromString} from 'filesystem';

export interface CommandLineOptions {
  project: Project;
}

export const parseCommandLine = (): CommandLineOptions => {
  var args = minimist(argv.slice(2), parseOptions());

  const path = pathFromString(args['project']);

  if (path.exists() === false) {
    throw new PathException(`Project path does not exist: ${path.string()}`);
  }

  const project: Project = {
    basePath: path.string(),
    tsconfig: tsconfig(path),
    rootModule: {
      source: args['module'],
      symbol: args['symbol'],
    }
  };

  return {project};
};

const tsconfig = (fromRoot: Path): string => {
  throw new Error('Not implemented');
}

const parseOptions = (): minimist.Opts => ({
  alias: {
    project: ['p', 'tsconfig']
  },
  default: {
    project: cwd()
  }
});