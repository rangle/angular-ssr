import {Provider} from '@angular/core';

import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationBootstrapper, ApplicationStateReader, Postprocessor, VariantsMap} from '../contracts';
import {ConfigurationException} from '../../exception';
import {FileReference, fileFromString} from '../../filesystem';
import {PrebootQueryable, PrebootConfiguration} from '../preboot';
import {RenderOperation} from '../operation';
import {Route} from '../../route';

export abstract class ApplicationBuilderBase<V> implements ApplicationBuilder<V> {
  protected operation: Partial<RenderOperation> = {stabilizeTimeout: 5000};

  constructor(templateDocument?: FileReference | string) {
    if (templateDocument) {
      this.templateDocument(templateDocument.toString());
    }
  }

  abstract build(): Application<V>;

  templateDocument(template?: string) {
    if (template != null) {
      this.operation.templateDocument = templateFileToTemplateString(template);
    }
    return this.operation.templateDocument;
  }

  bootstrap(bootstrapper?: ApplicationBootstrapper) {
    if (this.operation.bootstrappers == null) {
      this.operation.bootstrappers = [];
    }
    this.operation.bootstrappers.push(bootstrapper);
  }

  postprocess(transform?: Postprocessor) {
    if (this.operation.postprocessors == null) {
      this.operation.postprocessors = [];
    }
    this.operation.postprocessors.push(transform);
  }

  providers(providers: Array<Provider>) {
    if (this.operation.providers == null) {
      this.operation.providers = [];
    }
    this.operation.providers.push(...providers);
  }

  variants(map: VariantsMap) {
    this.operation.variants = map;
  }

  routes(routes?: Array<Route>) {
    this.operation.routes = routes;
  }

  preboot(preboot: PrebootConfiguration | boolean = true) {
    const config = typeof preboot === 'boolean'
      ? preboot === true
        ? {} as PrebootQueryable
        : null
      : preboot as PrebootQueryable;

    this.operation.preboot = config;
  }

  stateReader<R>(stateReader?: ApplicationStateReader<R>) {
    this.operation.stateReader = stateReader;
  }

  // Wait for n milliseconds for the app to become stable (all asynchronous operations finished)
  // before serializing the DOM. If the value is zero, we will not wait at all, but this is inadvisable.
  // Best practice is to set this value very low for on-demand rendering (150ms approx) and much higher
  // for build-time rendering (since performance is not a concern in that case). Depending on what
  // your application does -- eg. HTTP requests -- you may need to adjust this value. Generally we
  // will wait for all async operations to finish, unless they take longer than {@link milliseconds}
  // in which case we will render the app as-is.
  stabilizeTimeout(milliseconds?: number): number | null {
    if (milliseconds !== undefined) {
      this.operation.stabilizeTimeout = milliseconds;
    }
    return this.operation.stabilizeTimeout;
  }
}

const templateFileToTemplateString = (fileOrTemplate: string): string => {
  const file = fileFromString(fileOrTemplate);

  if (file.exists()) {
    return file.content();
  }
  else if (/<html/i.test(fileOrTemplate) === false) {
    throw new ConfigurationException(`Invalid template file or missing <html> element: ${fileOrTemplate}`);
  }
  return fileOrTemplate;
}