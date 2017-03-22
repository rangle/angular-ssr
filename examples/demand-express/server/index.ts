import './vendor';

import url = require('url');

import express = require('express');

import {ApplicationFromModule, DocumentStore} from 'angular-ssr';

import {AppModule} from '../app/app.module';

import {dist, index} from './paths';

const http = express();

http.use(express.static(dist, {index}));

http.use(require('express-blank-favicon'));

const application = new ApplicationFromModule(AppModule, index);

application.prerender()
  .then(snapshots => {
    snapshots.subscribe(
      snapshot => {
        http.get(snapshot.uri, (req, res) => res.send(snapshot.renderedDocument));
      });
  });

const documentStore = new DocumentStore(application);

http.get('*', (request, response) => {
  documentStore.load(originalUri(request))
    .then(snapshot => {
      response.send(snapshot.renderedDocument);
    })
    .catch(exception => {
      response.sendFile(index); // fall back on client document
    });
});

const originalUri = (request: express.Request): string => {
  return url.format({
    protocol: request.protocol,
    host: request.get('host'),
    pathname: request.originalUrl
  });
}

const port = process.env.PORT || 8080;

http.listen(port, () => console.log(`Site available at http://localhost:${port}/blog/1 (or try other blog ID numbers to see demand loading in action)`));
