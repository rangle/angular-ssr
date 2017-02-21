import commander = require('commander');

import {join} from 'path';

import {Project} from '../application';

import {PathException} from '../exception';

import {
  FilesystemType,
  Path,
  fileFromString,
  pathFromString,
} from '../filesystem';

const {version} = require('../../package.json');

export interface CommandLineOptions {
  project: Project;
  templateDocument: string;
}

export const commandLineToOptions = (): CommandLineOptions => {
  const options = parseCommandLine();

  const path = pathFromString(options['project']);

  const tsconfig: string = tsconfigFromRoot(path);

  if (path.exists() === false) {
    throw new PathException(`Project path does not exist: ${path.string()}`);
  }

  const project: Project = {
    basePath: path.string(),
    tsconfig,
    rootModule: {
      source: options['module'],
      symbol: options['symbol'],
    }
  };

  const template = fileFromString(options['template']);

  if (template.exists() === false) {
    throw new PathException(`HTML template document does not exist: ${options['template']}`);
  }

  return {project, templateDocument: template.content()};
};

const parseCommandLine = () => {
  return commander
    .version(version)
    .description('Prerender Angular applications')
    .option('-p, --project <path>', 'Path to tsconfig.json file or project root (if tsconfig.json lives in the root)', process.cwd())
    .option('-t, --template <path>', 'HTML template document', 'dist/index.html')
    .option('-o, --output <path>', 'Output path to write rendered HTML documents to', null)
    .option('-i, --ipc', 'Send rendered documents to parent process through IPC instead of writing them to disk', false)
    .parse(process.argv);
};

const tsconfigFromRoot = (fromRoot: Path): string => {
  if (fromRoot.type().is(FilesystemType.Directory) === false) {
    return fromRoot.string();
  }

  const candidate = fileFromString(join(fromRoot.string(), 'tsconfig.json'));
  if (candidate.exists() === false) {
    throw new PathException(`Cannot find tsconfig.json in ${candidate.path()}`);
  }

  return candidate.path();
};