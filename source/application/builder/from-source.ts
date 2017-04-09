import {Application} from './application';
import {ApplicationBase} from './application-base';
import {ApplicationRuntimeProject, ServerPlatform, RuntimeModuleLoader,  createStaticPlatform} from '../../platform';
import {ApplicationBuilderBase} from './builder-base';
import {ModuleDeclaration, Project} from '../project';
import {FileReference} from '../../filesystem';
import {RenderOperation} from '../operation';
import {getCompilerFromProject} from '../compiler';

export class ApplicationBuilderFromSource<V> extends ApplicationBuilderBase<any> {
  constructor(public project: Project, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  build(): Application<V> {
    const compiler = getCompilerFromProject(this.project);

    const loader = compiler.compile();

    const moduleFactory = loader.then(c => c.load());

    let applicationInstance;

    const platform: ServerPlatform = createStaticPlatform([
      {provide: ApplicationRuntimeProject, useFactory: () => applicationInstance},
      {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
    ]) as ServerPlatform;

    class ApplicationFromSourceImpl extends ApplicationBase<V, any> {
      constructor(operation: RenderOperation) {
        super(platform, operation, () => moduleFactory);

        applicationInstance = this;
      }

      load(module: ModuleDeclaration): Promise<any> {
        return loader.then(c => c.lazy(module));
      }

      async dispose() {
        const c = await loader;

        c.dispose();

        platform.destroy();
      }
    }

    return new ApplicationFromSourceImpl(<RenderOperation> this.operation);
  }
}
