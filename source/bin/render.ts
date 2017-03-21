import 'reflect-metadata';

import './runtime';

import {
  ApplicationRenderer,
  ApplicationFromSource,
  HtmlOutput,
  logger,
} from '../index';

import {commandLineToOptions} from './options';

const options = commandLineToOptions();

logger.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

const output = new HtmlOutput(options.output);

const applicationRenderer = new ApplicationRenderer(application);

const execute = async () => {
  try {
    await applicationRenderer.renderTo(output);
  }
  catch (exception) {
    logger.error(`Failed to render application: ${exception.stack || exception.toString()}`);
  }
  finally {
    application.dispose();
  }
};

execute();
