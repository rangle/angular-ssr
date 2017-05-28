import './vendor';

import {dirname} from 'path';

import {env, exit} from 'process';

import chalk = require('chalk');

const Module = require('module');

import {
  Files,
  applicationBuilderFromSource,
  applicationPrerenderer,
  log,
  pathFromString,
} from '../index';

import {parseCommandLineOptions} from './options';

const options = parseCommandLineOptions();

adjustEnvironment();

log.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const builder = applicationBuilderFromSource(options.project, options.templateDocument);

builder.preboot(options.preboot);

// Since we are doing rendering at build time, there is no need to enforce quick zone stabilization.
// We can bump it up so that the process does not fail if an HTTP request takes a long time or
// something along those lines prevents the app zone from stabilizing quickly.
builder.stabilizeTimeout(16000);

const application = builder.build();

const applicationRenderer = applicationPrerenderer(application);

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

    exit(1);
  });

function adjustEnvironment() {
  // Because we compile our outputs to a temporary path outside the filesystem structure of
  // the project, we must tweak the module search paths to look inside the project node
  // modules folder as well as our own modules folder. Otherwise we are going to encounter
  // require exceptions when the application attempts to load libraries.
  const roots = [options.project.basePath, pathFromString(dirname(module.filename))];

  const search = roots.map(r => r.findInAncestor(Files.modules)).filter(f => f != null).map(f => f.toString());

  const originalCall = Module._nodeModulePaths;

  Module._nodeModulePaths = function (from) {
    return [...originalCall.call(this, from), ...search];
  };

  Object.assign(env, {NG_RENDER: true});
}