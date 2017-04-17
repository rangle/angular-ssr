import {OutputProducer} from '../../output';

import {Application} from '../builder';

import {assertSnapshot} from '../../snapshot/assert';

export class ApplicationPrerenderer {
  constructor(private application: Application<any>) {}

  async prerenderTo(output: OutputProducer): Promise<void> {
    output.initialize();

    const snapshots = await this.application.prerender();

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
}
