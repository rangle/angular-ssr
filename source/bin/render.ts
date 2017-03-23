import 'reflect-metadata';

import './runtime';

import {
  ApplicationRenderer,
  ApplicationFromSource,
  HtmlOutput,
  log,
} from '../index';

import {commandLineToOptions} from './options';

const options = commandLineToOptions();

log.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

const output = new HtmlOutput(options.output);

const applicationRenderer = new ApplicationRenderer(application);

const execute = async () => {
  try {
    await applicationRenderer.prerenderTo(output);
  }
  catch (exception) {
    log.error(`Failed to render application: ${exception.toString()}`);
  }
  finally {
    application.dispose();
  }
};

execute();
