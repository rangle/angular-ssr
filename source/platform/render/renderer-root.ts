import {
  APP_ID,
  Inject,
  Injectable,
  RenderComponentType,
  Renderer,
  RootRenderer
} from '@angular/core';

import {RendererImpl} from './renderer';

@Injectable()
export class RootRendererImpl implements RootRenderer {
  private components = new Map<string, Renderer>();

  constructor(@Inject(APP_ID) private applicationId: string) {}

  renderComponent(component: RenderComponentType): Renderer {
    return this.components.get(component.id) || this.renderFactory(component);
  }

  private renderFactory(component: RenderComponentType): Renderer {
    const renderer = new RendererImpl(
      this,
      component,
      `${this.applicationId}-${component.id}`);

    this.components.set(component.id, renderer);

    return renderer;
  }
}