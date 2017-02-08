import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {VariantWithTransformer} from '../variant';

import {acquirePlatform} from '../platform';

import {RenderRoute} from './render-route';
import {RenderDocument} from './render-document';
import {wrapModule} from './module';
import {serialize} from './serialize';

export class DocumentRenderer {
  render<M, V>(moduleType: Type<M>, routes: Iterable<RenderRoute>, variants: Iterable<VariantWithTransformer<V>>): Observable<RenderDocument<V>> {
    return Observable.create(publish => {
      const promises = new Array<Promise<void>>();

      for (const route of routes) {
        for (const variant of variants) {
          const promise = this.renderVariant<M, V>(moduleType, route, variant)
            .then(document => {
              publish.next(document);
            });

          promises.push(promise);
        }
      }

      Promise.all(promises)
        .then(() => {
          publish.complete();
        })
        .catch(exception => {
          publish.error(new Error(`Catastrophic rendering exception: ${exception.stack}`));
        })
    });
  }

  private async renderVariant<M, V>(moduleType: Type<M>, route: RenderRoute, variant: VariantWithTransformer<V>): Promise<RenderDocument<V>> {
    const platform = acquirePlatform();

    const moduleWrapper = wrapModule(moduleType, route, variant);

    return <Promise<any>> platform.bootstrapModule(moduleWrapper)
      .then(moduleRef => {
        try {
          return serialize<M, V>(moduleRef);
        }
        finally {
          moduleRef.destroy();
        }
      });
  }
}