import './vendor';

import express = require('express');

import {enableProdMode} from '@angular/core';

import {ApplicationBuilderFromModule} from 'angular-ssr';

import {AppModule} from '../app/app.module';

import {absoluteUri, configure, listen} from './http';

import {Variants, variants} from './variants';

import {index} from './paths';

const http = express();

configure(http);

enableProdMode();

const builder = new ApplicationBuilderFromModule<Variants, AppModule>(AppModule, index);

builder.variants(variants);

const application = builder.build();

http.get(/.*/, async (request, response) => {
  try {
    const options: Variants = {locale: request.cookies['locale'] || 'en-US'};

    const snapshot = await application.renderUri(absoluteUri(request), options);

    response.send(snapshot.renderedDocument);
  }
  catch (exception) {
    response.send(builder.templateDocument()); // fall back on client document
  }
});

listen(http).then(port => console.log(`Load http://localhost:${port}/blog/1 (or try other blog ID numbers to see demand loading)`));
