import './vendor';

import url = require('url');

import express = require('express');

import cookieParser = require('cookie-parser');

import {ApplicationFromModule, DocumentVariantStore} from 'angular-ssr';

import {AppModule} from '../app/app.module';

import {dist, index} from './paths';

import {Variants, variants} from './variants';

const http = express();

http.use(express.static(dist, {index}));

http.use(require('express-blank-favicon'));

http.use(cookieParser());

const application = new ApplicationFromModule<Variants, AppModule>(AppModule, index);
application.variants(variants);

application.prerender()
  .then(snapshots => {
    snapshots.subscribe(
      snapshot => {
        http.get(snapshot.uri, (req, res) => res.send(snapshot.renderedDocument));
      });
  });

const documentStore = new DocumentVariantStore(application);

http.get('*', (request, response) => {
  documentStore.load(originalUri(request), {locale: request.cookies['locale'] || 'en-US'})
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
