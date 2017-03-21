import './vendor';

import 'rxjs/add/operator/toPromise';

import * as express from 'express';

import {AppModule} from '../app/app.module';

import {ApplicationFromModule, DocumentStore} from 'angular-ssr';

import {join} from 'path';

const dist = join(process.cwd(), 'dist');

const http = express();

const index = join(dist, 'index.html');

const application = new ApplicationFromModule(AppModule, index);

const prerender = async () => {
  const snapshots = await application.prerender();

  snapshots.subscribe(
    snapshot => {
      http.get(snapshot.uri, (req, res) => res.send(snapshot.renderedDocument));
    },
    exception => {
      console.error(`Catastrophic prerender failure: ${exception.toString()}`);
    });
};

prerender();

const documentStore = new DocumentStore(application);

http.get('*',
  (request, response) => {
    documentStore.load(request.url)
      .then(snapshot => {
        response.send(snapshot.renderedDocument);
      })
      .catch(exception => {
        response.sendFile(index); // fall back on client document
      });
  });

const port = process.env.PORT || 8080;

http.listen(port, () => {
  console.log(`Site available at http://localhost:${port}/`);
});