import {ApplicationFromSource} from '../application';

import {Snapshot} from '../snapshot';

import {parseCommandLine} from './options';

const options = parseCommandLine();

const application = new ApplicationFromSource(options.project);

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
    console.error('Failed to render application', exception);
  });