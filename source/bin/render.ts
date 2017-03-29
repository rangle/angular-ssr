import 'reflect-metadata';

import './runtime';

import {
  ApplicationRenderer,
  ApplicationBuilderFromSource,
  HtmlOutput,
  log,
} from '../index';

import {commandLineToOptions} from './options';

const options = commandLineToOptions();

log.info(`Rendering application from source (working path: ${options.project.workingPath})`);

const builder = new ApplicationBuilderFromSource(options.project);
builder.templateDocument(options.templateDocument);

const application = builder.build();

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
