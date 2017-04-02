import 'reflect-metadata';

import {registerTranspiler} from './runtime';

import './styles';

import {
  ApplicationRenderer,
  ApplicationBuilderFromSource,
  HtmlOutput,
  log,
} from '../index';

import {commandLineToOptions} from './options';

const options = commandLineToOptions();

registerTranspiler(options['no-transpile'] || []);

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
