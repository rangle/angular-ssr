import commander = require('commander');

import chalk = require('chalk');

import {dirname, join, resolve} from 'path';

import {cwd} from 'process';

import {
  ConfigurationException,
  FileReference,
  FileType,
  Files,
  HtmlOutput,
  InterprocessOutput,
  PathReference,
  PrebootConfiguration,
  Project,
  OutputProducer,
  absoluteFile,
  fileFromString,
  fromJson,
  pathFromRandomId,
  pathFromString,
  validatePrebootOptionsAgainstSchema
} from '../../index';

import {CommandLineOptions} from './options';

const {version} = require('../../../package.json');

export const parseCommandLineOptions = (): CommandLineOptions => {
  const options = parseCommandLine();

  const path = pathFromString(options['project']);

  const tsconfig = tsconfigFromRoot(path);

  if (path.exists() === false) {
    throw new ConfigurationException(`Project path does not exist: ${path}`);
  }

  const source = options['module'] ? options['module'].replace(/\.(js|ts)$/, String()) : null;
  const symbol = options['symbol'];

  const debug = options['debug'] || false;

  let environment: string = options['environment'];
  if (environment == null || environment.length === 0) {
    if (debug) {
      environment = 'dev';
    }
    else {
      environment = 'prod';
    }
  }

  const template = fileFromString(options['template']);

  if (template.exists() === false) {
    throw new ConfigurationException(`HTML template document does not exist: ${options['template']}`);
  }

  const webpack = options['webpack'];

  const preboot: PrebootConfiguration | boolean = getPrebootConfiguration(enablePreboot);

  const project: Project = {
    applicationModule: {source, symbol},
    basePath: rootFromTsconfig(tsconfig),
    environment,
    tsconfig,
    workingPath: pathFromRandomId(),
  };

  const output = createOutput(options);

  return {
    debug,
    output,
    preboot,
    project,
    templateDocument: template.content(),
    webpack
  };
};

let enablePreboot: boolean = false;

let enableInline: boolean = true;

const createOutput = (options): OutputProducer =>
  options['ipc']
    ? createInterprocessOutput(options)
    : createHtmlOutput(options);

const createInterprocessOutput = (options): OutputProducer => new InterprocessOutput();

const createHtmlOutput = (options): OutputProducer => {
  let outputString = options['output'];

  if (/^(\\|\/)/.test(outputString) === false) {
    outputString = join(cwd(), outputString);
  }

  const output = pathFromString(outputString);

  return new HtmlOutput(output, enableInline);
};

const parseCommandLine = () => {
  const options = commander
    .version(version)
    .description(chalk.green('Prerender Angular applications'))
    .option('-e, --environment <environment>', 'Environment selector (dev, prod) (if not specified, will automatically choose based on --debug')
    .option('-d, --debug', 'Enable debugging (stack traces and so forth)', false)
    .option('-p, --project <path>', 'Path to tsconfig.json file or project root (if tsconfig.json lives in the root)', cwd())
    .option('-w, --webpack <config>', 'Optional path to webpack configuration file')
    .option('-t, --template <path>', 'HTML template document', 'dist/index.html')
    .option('-m, --module <path>', 'Path to root application module TypeScript file')
    .option('-s, --symbol <identifier>', 'Class name of application root module')
    .option('-o, --output <path>', 'Output path to write rendered HTML documents to', 'dist')
    .option('-a, --application <applicationID>', 'Optional application ID if your CLI configuration contains multiple apps')
    .option('-P, --preboot [boolean | json-file | json-text]', 'Enable or disable preboot with optional configuration file or JSON text (otherwise automatically find the root element and use defaults)')
    .option('-i, --inline [boolean]', 'Inline of resources referenced in links')
    .option('-I, --ipc', 'Send rendered documents to parent process through IPC instead of writing them to disk', false);

  options.on('preboot', value => enablePreboot = value || true);

  options.on('inline', value => enableInline = value == null ? true : value);

  return options.parse(process.argv);
};

const rootFromTsconfig = (tsconfig: FileReference): PathReference => {
  const parsed = fromJson<{extends?: string}>(tsconfig.content());

  if (parsed.extends) {
    return pathFromString(resolve(dirname(join(tsconfig.parent().toString(), parsed.extends))));
  }
  else {
    return tsconfig.parent();
  }
};

const tsconfigFromRoot = (fromRoot: PathReference): FileReference => {
  if (fromRoot.exists() === false) {
    throw new ConfigurationException(`Root path does not exist: ${fromRoot}`);
  }

  if (fromRoot.type() === FileType.File) {
    return fileFromString(fromRoot.toString());
  }

  for (const tsc of Files.tsconfig) {
    const candidates = [
      fromRoot,
      ...Array.from(fromRoot.directories()),
      ...Array.from(fromRoot.parent().directories())
    ].filter(p => /(\\|\/)e2e(\\|\/)/.test(p.toString()) === false);

    const found = candidates.map(d => fileFromString(join(d.toString(), tsc))).find(c => c.exists());
    if (found) {
      return found;
    }
  }

  return null;
};

const getPrebootConfiguration = (filenameOrJson: string | boolean): PrebootConfiguration | boolean => {
  if (typeof filenameOrJson !== 'string') {
    return filenameOrJson == null ? false : filenameOrJson;
  }

  switch (filenameOrJson as string) {
    case 'true':
    case 'false':
    case '':
      return filenameOrJson !== 'false';
    default:
      return parsePreboot(filenameOrJson as string);
  }
};

const parsePreboot = (json: string): PrebootConfiguration | boolean => {
  let options: PrebootConfiguration;

  if (json.trim().startsWith('{')) {
    try {
      options = fromJson<PrebootConfiguration>(json);
    }
    catch (exception) {
      throw new ConfigurationException('Preboot configuration: invalid JSON document', exception);
    }
  }
  else if (json.length > 0) {
    const file = absoluteFile(cwd(), json);

    if (file.exists() === false || file.type() !== FileType.File) {
      throw new ConfigurationException(`Preboot configuration file does not exist or is not a file: ${file.toString()}`);
    }

    options = fromJson<PrebootConfiguration>(file.content());
  }
  else {
    return true;
  }

  const validation = validatePrebootOptionsAgainstSchema(options);

  if (validation.errors.length > 0) {
    throw new ConfigurationException(`Preboot configuration ${json} is invalid: ${validation.toString()}`)
  }

  return options;
}