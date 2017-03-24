import './vendor';

import express = require('express');

import {enableProdMode} from '@angular/core';

import {ApplicationFromModule, DocumentVariantStore} from 'angular-ssr';

import {AppModule} from '../app/app.module';

import {absoluteUri, configure, listen} from './http';
import {index} from './paths';
import {variants, Variants} from './variants';

const http = express();

configure(http);

enableProdMode();

const application = new ApplicationFromModule<Variants, AppModule>(AppModule, index);

application.variants(variants);

const documentStore = new DocumentVariantStore(application); // has default lru cache size

http.get('*', (request, response) => {
  documentStore.load(absoluteUri(request), {locale: request.cookies['locale'] || 'en-US'})
    .then(snapshot => {
      response.send(snapshot.renderedDocument);
    })
    .catch(exception => {
      response.send(application.templateDocument()); // fall back on client document
    });
});

listen(http).then(port => console.log(`Load http://localhost:${port}/blog/1 (or try other blog ID numbers to see demand loading)`));