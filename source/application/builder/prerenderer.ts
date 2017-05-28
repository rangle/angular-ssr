import {OutputProducer} from '../../output';

import {Application} from '../builder';

import {assertSnapshot} from '../../snapshot/assert';

export interface ApplicationPrerenderer {
  prerenderTo(output: OutputProducer): Promise<void>;
}

export const applicationPrerenderer = <V>(application: Application<V>): ApplicationPrerenderer => {
  return {
    prerenderTo: async (output: OutputProducer): Promise<void> => {
      output.initialize();

      const snapshots = application.prerender();

      return new Promise<void>((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);

            output.write(snapshot);
          },
          exception => {
            reject(new Error(`Fatal renderer exception: ${exception.toString()}`));

            output.exception(exception);
          },
          () => resolve());
      });
    }
  };
};