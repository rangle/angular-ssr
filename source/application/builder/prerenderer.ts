import {Application} from '../builder';
import {OutputProducer} from '../../output';
import {PrerenderOptions} from './options';

import {assertSnapshot} from '../../snapshot/assert';

export interface ApplicationPrerenderer {
  prerenderTo(output: OutputProducer, options?: PrerenderOptions): Promise<void>;
}

export const applicationPrerenderer = <V>(application: Application<V>): ApplicationPrerenderer => {
  return {
    prerenderTo: async (output: OutputProducer, options?: PrerenderOptions): Promise<void> => {
      output.initialize();

      const snapshots = application.prerender(options);

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