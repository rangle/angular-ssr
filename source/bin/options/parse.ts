import commander = require('commander');

import chalk = require('chalk');

import {join} from 'path';

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
  OutputOptions,
  OutputProducer,
  absoluteFile,
  fileFromString,
  fromJson,
  pathFromRandomId,
  pathFromString,
  validatePrebootOptionsAgainstSchema,
  makeAbsolute
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
    pessimistic,
    preboot,
    project,
    templateDocument: template.content(),
    webpack,
    blacklist
  };
};

// Enable preboot integration
let enablePreboot: boolean = false;

// Ignore routes that fail to render (just emit warnings instead of failing the process)
let pessimistic = false;

// Inline CSS resources in the compiled HTML output
let inlineStylesheets: boolean = true;

// Inline SVG <use xlink:href> instances to deal with absolute paths that wrongly include localhost
let inlineVectorGraphics: boolean = false;

// Enable 'blacklist by default' route rendering behaviour (each route you wish to render must be marked with `server: true')
let blacklist: boolean = false;

// The name of files to generate for each route (index.html, eg foo/index.html)
let filename: string = Files.index;

const renderOptions = (options): OutputOptions => {
  let outputString = options['output'];

  if (/^(\\|\/)/.test(outputString) === false) {
    outputString = join(cwd(), outputString);
  }

  const output = pathFromString(outputString);

  return {filename, output, inlineStylesheets, inlineVectorGraphics};
};

const createOutput = (options): OutputProducer =>
  options['ipc']
    ? createInterprocessOutput(renderOptions(options))
    : createHtmlOutput(renderOptions(options));

const createInterprocessOutput = (options: OutputOptions): OutputProducer => new InterprocessOutput(options);

const createHtmlOutput = (options: OutputOptions): OutputProducer => new HtmlOutput(options);

const parseCommandLine = () => {
  const options = commander
    .version(version)
    .description(chalk.green('Prerender Angular applications'))
    .option('-e, --environment <environment>', 'Environment selector (dev, prod) (if not specified, will automatically choose based on --debug')
    .option('-d, --debug', 'Enable debugging (stack traces and so forth)', false)
    .option('-p, --project <path>', 'Path to tsconfig.json file or project root (if tsconfig.json lives in the root)', cwd())
    .option('-w, --webpack <config>', 'Optional path to webpack configuration file')
    .option('-t, --template <path>', 'HTML template document', 'dist/index.html')
    .option('-f, --filename <path>', 'Change the name of the HTML files that are produced', filename)
    .option('-m, --module <path>', 'Path to root application module TypeScript file')
    .option('-s, --symbol <identifier>', 'Class name of application root module')
    .option('-o, --output <path>', 'Output path to write rendered HTML documents to', 'dist')
    .option('-a, --application <applicationID>', 'Optional application ID if your CLI configuration contains multiple apps')
    .option('-P, --preboot [boolean | json-file | json-text]', 'Enable or disable preboot with optional configuration file or JSON text (otherwise automatically find the root element and use defaults)')
    .option('-R, --pessimistic [boolean]', 'Ignore routes that fail to render (just emit warnings, do not fail the whole run)')
    .option('-i, --inline [boolean]', 'Inline of resources referenced in links')
    .option('-S, --inline-svg [boolean]', 'Inline SVG <use xlink:href> instances (to resolve issues with absolute URI SVG identifiers eg http://localhost/#foo')
    .option('-I, --ipc', 'Send rendered documents to parent process through IPC instead of writing them to disk', false)
    .option('-b, --blacklist [boolean]', 'Blacklist all routes by default such that all routes which should be rendered must be specially marked with "server: true" in the route definition', false)

  options.on('preboot',
    value => enablePreboot = value == null ? true : value);

  options.on('inline',
    value => inlineStylesheets = value == null ? true : value);

  options.on('inline-svg',
    value => inlineVectorGraphics = value == null ? true : value);

  options.on('blacklist',
    value => blacklist = value == null ? true : value);

  options.on('pessimistic',
    value => pessimistic = value == null ? true : value);

  options.on('filename', value => filename = value);

  return options.parse(process.argv);
};

const rootFromTsconfig = (tsconfig: FileReference): PathReference => {
  const parsed = fromJson<{extends?: string, compilerOptions}>(tsconfig.content());

  if (parsed.compilerOptions) {
    const root = parsed.compilerOptions.baseUrl || parsed.compilerOptions.sourceRoot;

    if (root) {
      return pathFromString(makeAbsolute(tsconfig.parent(), root));
    }
  }
  return tsconfig.parent();
};

const tsconfigFromRoot = (fromRoot: PathReference): FileReference => {
  if (fromRoot.exists() === false) {
    throw new ConfigurationException(`Root path does not exist: ${fromRoot}`);
  }

  if (fromRoot.type() === FileType.File) {
    return fileFromString(fromRoot.toString());
  }

  for (const tsc of Files.tsconfig) {
    const candidates = Array.from(fromRoot.directories()).concat(fromRoot)
      .filter(p => /(\\|\/)e2e(\\|\/)/.test(p.toString()) === false);

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
