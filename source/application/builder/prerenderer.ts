import {OutputProducer} from '../../output';

import {ApplicationBase} from '../builder';

export class ApplicationRenderer {
  constructor(private application: ApplicationBase<any, any>) {}

  async prerenderTo(output: OutputProducer): Promise<void> {
    output.initialize();

    const snapshots = await this.application.prerender();

    return new Promise<void>((resolve, reject) => {
      snapshots.subscribe(
        snapshot => output.write(snapshot),
        exception => {
          reject(new Error(`Fatal renderer exception: ${exception.toString()}`));

          output.exception(exception);
        },
        resolve);
    });
  }
}
