import commander = require('commander');

import {dirname, join} from 'path';

import {
  FileType,
  PathReference,
  ConfigurationException,
  Project,
  getTemporaryWorkingPath,
  fileFromString,
  pathFromString,
  tsconfig,
} from '../index';

const {version} = require('../../package.json');

export interface CommandLineOptions {
  project: Project;
  output: PathReference;
  templateDocument: string;
}

export const commandLineToOptions = (): CommandLineOptions => {
  const options = parseCommandLine();

  const path = pathFromString(options['project']);

  const tsconfig: string = tsconfigFromRoot(path);

  if (path.exists() === false) {
    throw new ConfigurationException(`Project path does not exist: ${path}`);
  }

  const source = options['module'];
  const symbol = options['symbol'];

  const project: Project = {
    basePath: dirname(tsconfig),
    tsconfig,
    workingPath: getTemporaryWorkingPath(),
    applicationModule: {source, symbol},
  };

  const template = fileFromString(options['template']);

  if (template.exists() === false) {
    throw new ConfigurationException(`HTML template document does not exist: ${options['template']}`);
  }

  let outputString = options['output'];

  if (/^(\\|\/)/.test(outputString) === false) {
    outputString = join(process.cwd(), outputString);
  }

  const output = pathFromString(outputString);

  return {output, project, templateDocument: template.content()};
};

const parseCommandLine = () => {
  return commander
    .version(version)
    .description('Prerender Angular applications')
    .option('-p, --project <path>', 'Path to tsconfig.json file or project root (if tsconfig.json lives in the root)', process.cwd())
    .option('-t, --template <path>', 'HTML template document', 'dist/index.html')
    .option('-m, --module <path>', 'Path to root application module TypeScript file')
    .option('-s, --symbol <identifier>', 'Class name of application root module')
    .option('-o, --output <path>', 'Output path to write rendered HTML documents to', 'dist')
    .option('-i, --ipc', 'Send rendered documents to parent process through IPC instead of writing them to disk', false)
    .parse(process.argv);
};

const tsconfigFromRoot = (fromRoot: PathReference): string => {
  if (fromRoot.exists() === false) {
    throw new ConfigurationException(`Root path does not exist: ${fromRoot}`);
  }

  if (fromRoot.type().is(FileType.File)) {
    return fromRoot.toString();
  }

  const candidates = [fromRoot, ...Array.from(fromRoot.directories())]
    .map(d => join(d.toString(), tsconfig))
    .filter(c => /(e2e|test)/.test(c) === false);

  const matchingFile = candidates.map(fileFromString).find(c => c.exists());
  if (matchingFile) {
    return matchingFile.toString();
  }

  throw new ConfigurationException(`Cannot find tsconfig in ${fromRoot}`);
};