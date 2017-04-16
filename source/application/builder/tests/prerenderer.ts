import {Observable} from 'rxjs';

import {Application} from '../application';
import {ApplicationPrerenderer} from '../prerenderer';

describe('ApplicationPrerenderer', () => {
  const application: Application<any> = {
    renderUri(uri: string, variant?) {
      return Promise.resolve({
        console: [],
        exceptions: [],
        renderedDocument: '<html></html>',
        uri
      });
    },
    async prerender() {
      return Observable.create(async (publish) => {
        publish.next(await this.renderUri('http://localhost/1'));
        publish.next(await this.renderUri('http://localhost/2'));
        publish.next(await this.renderUri('http://localhost/3'));
        publish.complete();
      });
    },
    discoverRoutes() {
      return Promise.resolve([]);
    },
    dispose() {}
  };

  it('prerenders an application to an OutputProducer', async (done) => {
    const renderer = new ApplicationPrerenderer(application);

    let count = 3;

    await renderer.prerenderTo({
      initialize() {},

      write(snapshot) {
        if (--count === 0) {
          done();
        }
        return Promise.resolve(void 0);
      },

      exception: (error) => Promise.resolve(void 0)
    })
  });
})