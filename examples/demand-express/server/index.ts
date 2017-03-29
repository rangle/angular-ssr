import './vendor';

import express = require('express');

import {enableProdMode} from '@angular/core';

import {ApplicationBuilderFromModule, DocumentVariantStore} from 'angular-ssr';

import {AppModule} from '../app/app.module';

import {absoluteUri, configure, listen} from './http';
import {index} from './paths';
import {variants, Variants} from './variants';

const http = express();

configure(http);

enableProdMode();

const builder = new ApplicationBuilderFromModule<Variants, AppModule>(AppModule, index);
builder.variants(variants);

const application = builder.build();

// NOTE(cbond): It is important to note that this caching implementation is limited and
// probably not suitable for your application. It is a fixed-size LRU cache that only
// makes sense for applications whose content does not change over time. If the content
// of your application routes does change over time, consider writing your own cache
// on top of application.renderUri or just avoid caching altogether.
const documentStore = new DocumentVariantStore(application);

http.get('*', (request, response) => {
  documentStore.load(absoluteUri(request), {locale: request.cookies['locale'] || 'en-US'})
    .then(snapshot => {
      response.send(snapshot.renderedDocument);
    })
    .catch(exception => {
      response.send(builder.templateDocument()); // fall back on client document
    });
});

listen(http).then(port => console.log(`Load http://localhost:${port}/blog/1 (or try other blog ID numbers to see demand loading)`));
