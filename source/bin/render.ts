import './vendor';

import chalk = require('chalk');

import {
  ApplicationPrerenderer,
  ApplicationBuilderFromSource,
  Files,
  PathReference,
  log,
  pathFromString,
} from '../index';

import {parseCommandLineOptions} from './options';

const options = parseCommandLineOptions();

patchModuleSearch(options.project.basePath, pathFromString(__dirname));

log.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const builder = new ApplicationBuilderFromSource(options.project, options.templateDocument);

builder.preboot(options.preboot);

// Since we are doing rendering at build time, there is no need to enforce quick zone stabilization.
// We can bump it up so that the process does not fail if an HTTP request takes a long time or
// something along those lines prevents the app zone from stabilizing quickly.
builder.stabilizeTimeout(16000);

const application = builder.build();

const applicationRenderer = new ApplicationPrerenderer(application);

const execute = async () => {
  try {
    await applicationRenderer.prerenderTo(options.output);
  }
  finally {
    // If we are debugging, then we are likely to produce a stack trace that includes compiled
    // output files. If we simply delete those files upon completion as we normally do, then
    // the developer will not be able to see what code is generating the issue they have.
    if (options.debug === false) {
      application.dispose();
    }
  }
};

execute()
  .catch(exception => {
    const message = options.debug
      ? chalk.red(exception.stack)
      : chalk.red(exception.message) + ' (use --debug to see a full stack trace)';

    log.error(`Failed to render application: ${message}`);

    process.exit(1);
  });

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
