import express = require('express');

import {ApplicationBuilderFromModule} from 'angular-ssr';

import {Injectable, enableProdMode} from '@angular/core';

import {AppModule} from '../app/app.module';
import {LocaleService} from '../app/locale/locale.service';
import {StateTransition} from 'angular-ssr';
import {absoluteUri, configure, listen} from './http';
import {index} from './paths';

enableProdMode();

@Injectable()
export class TransitionLocale implements StateTransition<string> {
  constructor(private service: LocaleService) {}

  transition(locale: string) {
    this.service.locale(locale);
  }
}

export interface Variants {
  locale: string;
}

const builder = new ApplicationBuilderFromModule<Variants, AppModule>(AppModule, index);

builder.variants({
  locale: { // select a locale based on renderUri arguments
    transition: TransitionLocale
  }
});

builder.preboot();

const application = builder.build();

const http = express();

configure(http);

http.get(/.*/, async (request, response) => {
  try {
    const options: Variants = {locale: request.cookies['locale'] || 'en-US'};

    const snapshot = await application.renderUri(absoluteUri(request), options);

    response.send(snapshot.renderedDocument);
  }
  catch (exception) {
    console.error('Rendering exception', exception);

    response.send(builder.templateDocument()); // fall back on client document
  }
});

listen(http).then(port => console.log(`Load http://localhost:${port}/blog/1 (or try other blog ID numbers to see demand loading)`));
