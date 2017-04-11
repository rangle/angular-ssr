import './vendor';

import chalk = require('chalk');

import {
  ApplicationRenderer,
  ApplicationBuilderFromSource,
  Files,
  HtmlOutput,
  PathReference,
  log,
  pathFromString,
} from '../index';

import {commandLineToOptions} from './options';

const options = commandLineToOptions();

patchModuleSearch(options.project.basePath, pathFromString(__dirname));

log.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const builder = new ApplicationBuilderFromSource(options.project, options.templateDocument);

builder.preboot(options.preboot);

const application = builder.build();

const applicationRenderer = new ApplicationRenderer(application);

const execute = async () => {
  try {
    await applicationRenderer.prerenderTo(new HtmlOutput(options.output));

    process.exitCode = 0;
  }
  catch (exception) {
    const message = options.debug
      ? chalk.red(exception.stack)
      : chalk.red(exception.message) + ' (use --debug to see a full stack trace)';

    log.error(`Failed to render application: ${message}`);

    process.exitCode = 1;
  }
  finally {
    application.dispose();
  }
};

execute();

// Because we compile our outputs to a temporary path outside the filesystem structure of
// the project, we must tweak the module search paths to look inside the project node
// modules folder as well as our own modules folder. Otherwise we are going to encounter
// require exceptions when the application attempts to load libraries.
function patchModuleSearch(...roots: Array<PathReference>) {
  const Module = require('module');

  const paths = Module._nodeModulePaths;

  const search = new Array<string>();

  for (const root of roots) {
    for (let iterator = root; iterator; iterator = iterator.parent()) {
      const modules = iterator.findInAncestor(Files.modules);
      if (modules == null) {
        break;
      }
      search.push(modules.toString());
    }
  }

  Module._nodeModulePaths = function (from) {
    return [...paths.call(this, from), ...search];
  };
}
