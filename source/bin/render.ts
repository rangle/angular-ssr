import '../dependencies';

import './transpile';

import {ApplicationFromSource} from '../application';

import {Snapshot} from '../snapshot';

import {commandLineToOptions} from './options';

const options = commandLineToOptions();

const application = new ApplicationFromSource(options.project);
application.templateDocument(options.templateDocument);

const render = async (): Promise<Array<Snapshot<any>>> => {
  const snapshots = await application.render();

  const rendered = new Array<Snapshot<any>>();

  return new Promise<Array<Snapshot<any>>>(
    (resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          rendered.push(snapshot);
        },
        exception => {
          reject(exception);
        });

      return rendered;
    });
};

render()
  .then(() => {
    console.log('Application rendering complete');
  })
  .catch(exception => {
    console.error(`Failed to render application: ${exception.message}`);
  });