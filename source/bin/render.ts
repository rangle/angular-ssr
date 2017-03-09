import '../dependencies';

import {ApplicationRenderer, ApplicationFromSource} from '../application';
import {HtmlOutput} from '../output';
import {commandLineToOptions} from './options';
import {logger} from './logger';

const options = commandLineToOptions();

logger.info('Starting application render process');

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

const output = new HtmlOutput(logger, options.output);

const applicationRenderer = new ApplicationRenderer(application);

applicationRenderer.renderTo(output)
  .catch(exception => {
    logger.error(`Failed to render application: ${exception.stack}`);
  })
  .then(() => {
    application.dispose();
  });