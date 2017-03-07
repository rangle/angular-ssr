import './runtime';

import {ApplicationFromSource} from '../application';
import {HtmlOutput} from '../output';
import {commandLineToOptions} from './options';
import {logger} from './logger';

const options = commandLineToOptions();

logger.info('Starting application render process');

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

const author = new HtmlOutput(logger, options.output);

author.initialize();

application.prerender()
  .then(snapshots => {
    snapshots.subscribe(
      snapshot => {
        author.write(snapshot);
      },
      exception => {
        logger.error(`Fatal render exception: ${exception}`);
      }
    );
    logger.info('Application rendering complete');
  })
  .catch(exception => {
    logger.error(`Failed to render application: ${exception.stack}`);
  });