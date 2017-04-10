import './vendor';

import {
  ApplicationRenderer,
  ApplicationBuilderFromSource,
  Files,
  HtmlOutput,
  PathReference,
  log,
} from '../index';

import {commandLineToOptions} from './options';

const Module = require('module');

const options = commandLineToOptions();

patchModuleSearch(options.project.basePath);

log.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const builder = new ApplicationBuilderFromSource(options.project, options.templateDocument);

const application = builder.build();

const applicationRenderer = new ApplicationRenderer(application);

const execute = async () => {
  try {
    await applicationRenderer.prerenderTo(new HtmlOutput(options.output));

    process.exitCode = 0;
  }
  catch (exception) {
    const message = options.debug
      ? exception.stack
      : exception.message + ' (use --debug to see a full stack trace)';

    log.error(`Failed to render application: ${message}`);

    process.exitCode = 1;
  }
  finally {
    application.dispose();
  }
};

execute();

function patchModuleSearch(root: PathReference) {
  const paths = Module._nodeModulePaths;

  const search = new Array<string>();

  for (let iterator = root; iterator; iterator = iterator.parent()) {
    const modules = iterator.findInAncestor(Files.modules);
    if (modules == null) {
      break;
    }
    search.push(modules.toString());
  }

  Module._nodeModulePaths = function (from) {
    return [...paths.call(this, from), ...search];
  };
}
