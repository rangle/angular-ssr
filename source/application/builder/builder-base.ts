import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationBootstrapper, ApplicationStateReader, Postprocessor, VariantsMap} from '../contracts';
import {ConfigurationException} from '../../exception';
import {FileReference, fileFromString} from '../../filesystem';
import {PrebootQueryable, PrebootConfiguration} from '../preboot';
import {RenderOperation} from '../operation';
import {Route} from '../../route';

export abstract class ApplicationBuilderBase<V> implements ApplicationBuilder<V> {
  protected operation: Partial<RenderOperation> = {};

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
    if (bootstrapper) {
      if (this.operation.bootstrappers == null) {
        this.operation.bootstrappers = [];
      }
      this.operation.bootstrappers.push(bootstrapper);
    }
    return this.operation.bootstrappers || [];
  }

  postprocess(transform?: Postprocessor) {
    if (transform) {
      if (this.operation.postprocessors == null) {
        this.operation.postprocessors = [];
      }
      this.operation.postprocessors.push(transform);
    }
    return this.operation.postprocessors || [];
  }

  variants(map: VariantsMap) {
    if (map) {
      this.operation.variants = map;
    }
    return this.operation.variants;
  }

  routes(routes?: Array<Route>) {
    if (routes) {
      this.operation.routes = routes;
    }
    return this.operation.routes || [];
  }

  preboot(preboot?: PrebootConfiguration | boolean) {
    if (preboot != null) {
      if (typeof preboot === 'boolean') {
        this.operation.preboot = preboot ? {} as PrebootQueryable : null;
      }
      else {
        this.operation.preboot = preboot as PrebootQueryable;
      }
    }
    return this.operation.preboot as PrebootConfiguration;
  }

  stateReader<R>(stateReader?: ApplicationStateReader<R>) {
    if (stateReader) {
      this.operation.stateReader = stateReader;
    }
    return this.operation.stateReader as any;
  }
}

const templateFileToTemplateString = (fileOrTemplate: string): string => {
  const file = fileFromString(fileOrTemplate);

  if (file.exists()) {
    return file.content();
  }
  else if (/<html>/i.test(fileOrTemplate) === false) {
    throw new ConfigurationException(`Invalid template file or missing <html> element: ${fileOrTemplate}`);
  }
  return fileOrTemplate;
}