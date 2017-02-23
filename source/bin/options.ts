import commander = require('commander');

import {dirname, join} from 'path';

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
    throw new PathException(`Project path does not exist: ${path}`);
  }

  const applicationModule =
    hasOptions(options, 'module', 'symbol')
      ? {
          source: options['module'],
          symbol: options['symbol'],
        }
      : null;

  const project: Project = {
    basePath: dirname(tsconfig),
    tsconfig,
    applicationModule,
  };

  const template = fileFromString(options['template']);

  if (template.exists() === false) {
    throw new PathException(`HTML template document does not exist: ${options['template']}`);
  }

  return {project, templateDocument: template.content()};
};

const hasOptions = (options, ...args: Array<string>) => args.every(o => options[o]);

const parseCommandLine = () => {
  return commander
    .version(version)
    .description('Prerender Angular applications')
    .option('-p, --project <path>', 'Path to tsconfig.json file or project root (if tsconfig.json lives in the root)', process.cwd())
    .option('-t, --template <path>', 'HTML template document', 'dist/index.html')
    .option('-m, --module <path>', 'Path to root application module TypeScript file')
    .option('-s, --symbol <identifier>', 'Class name of application root module')
    .option('-o, --output <path>', 'Output path to write rendered HTML documents to', null)
    .option('-i, --ipc', 'Send rendered documents to parent process through IPC instead of writing them to disk', false)
    .parse(process.argv);
};

const tsconfigFromRoot = (fromRoot: Path): string => {
  if (fromRoot.exists() === false) {
    throw new PathException(`Root path does not exist: ${fromRoot}`);
  }

  if (fromRoot.type().is(FilesystemType.File)) {
    return fromRoot.toString();
  }

  const tsconfig = 'tsconfig.json';

  const candidates = [
    fromRoot.toString(),
    ...Array.from(fromRoot.directories()).map(d => join(d.toString(), tsconfig))
  ].filter(c => /(e2e|test)/.test(c) === false);

  const matchingFile = candidates.map(fileFromString).find(c => c.exists());
  if (matchingFile) {
    return matchingFile.toString();
  }
  return null;
};