import {ApplicationBase} from '../application';
import {Route} from '../route';
import {Output} from '../output';
import {Snapshot} from '../snapshot';

export class ApplicationRenderer {
  constructor(private application: ApplicationBase<any, any>) {}

  renderTo(output: Output): Promise<void> {
    output.initialize();

    return new Promise<void>((resolve, reject) => {
      this.application.prerender()
        .then(snapshots => {
          snapshots.subscribe(
            snapshot => {
              output.write(snapshot);
            },
            exception => {
              reject(new Error(`Fatal render exception: ${exception.stack}`));
            },
            () => resolve());
        })
        .catch(exception => {
          reject(new Error(`Failed to render application: ${exception.stack}`));
        });
    });
  }

  renderRoute<V>(route: Route, variant?: V): Promise<Snapshot<V>> {
    return this.application.renderRoute(route, variant);
  }
}
