import 'reflect-metadata';

import '../dependencies';

import {ApplicationRenderer, ApplicationFromSource} from '../application';
import {HtmlOutput, logger} from '../output';
import {commandLineToOptions} from './options';

const options = commandLineToOptions();

logger.info('Starting application render process');

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

const output = new HtmlOutput(options.output);

const applicationRenderer = new ApplicationRenderer(application);

applicationRenderer.renderTo(output)
  .catch(exception => {
    logger.error(`Failed to render application: ${exception.stack}`);
  })
  .then(() => {
    application.dispose();
  });
