import {Application} from './application';
import {ApplicationBase} from './application-base';
import {ApplicationRuntimeProject, RuntimeModuleLoader} from '../../platform';
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

    let applicationInstance;

    const platform = compiler.createPlatform([
      {provide: ApplicationRuntimeProject, useFactory: () => applicationInstance},
      {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
    ]);

    const conditionalCompile = m =>
      typeof m !== 'object'
        ? platform.compileModule(m, [])
        : m;

    const moduleFactory = loader.then(l => l.load()).then(conditionalCompile);

    class ApplicationFromSourceImpl extends ApplicationBase<V, any> {
      constructor(operation: RenderOperation) {
        super(platform, operation, () => moduleFactory);

        applicationInstance = this;
      }

      load(module: ModuleDeclaration): Promise<any> {
        return loader.then(l => l.lazy(module));
      }

      async dispose() {
        const loadable = await loader;
        loadable.dispose();

        platform.destroy();
      }
    }

    return new ApplicationFromSourceImpl(<RenderOperation> this.operation);
  }
}
