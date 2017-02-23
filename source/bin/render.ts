import './runtime';

import {ApplicationFromSource} from '../application';
import {commandLineToOptions} from './options';

const options = commandLineToOptions();

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

application.render()
  .then(snapshots => {
    snapshots.subscribe(
      snapshot => {
        console.log('Rendered', snapshot);
      },
      exception => {
        console.error('Critical render exception', exception);
        process.exit(1);
      }
    );
    console.log('Application rendering complete');
  })
  .catch(exception => {
    console.error(`Failed to render application: ${exception.message}`);
  });