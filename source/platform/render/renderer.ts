import {
  AnimationPlayer,
  AnimationStyles,
  AnimationKeyframe,
  Renderer,
  RootRenderer,
  RenderComponentType,
} from '@angular/core';

import {AnimationPlayerImpl} from './animation-player';

export class RendererImpl extends Renderer {
  constructor(
    private root: RootRenderer,
    private component: RenderComponentType,
    private componentId: string,
  ) {
    super();
  }

  selectRootElement(selectorOrNode: string | any, debugInfo?) {
    throw new Error('Not implemented');
  }

  createElement(parentElement: any, name: string, debugInfo?) {
    throw new Error('Not implemented');
  }

  createViewRoot(hostElement: any) {
    throw new Error('Not implemented');
  }

  createTemplateAnchor(parentElement: any, debugInfo?) {
    throw new Error('Not implemented');
  }

  createText(parentElement: any, value: string, debugInfo?) {
    throw new Error('Not implemented');
  }

  projectNodes(parentElement: any, nodes: any[]): void {
    throw new Error('Not implemented');
  }

  attachViewAfter(node: any, viewRootNodes: any[]): void {
    throw new Error('Not implemented');
  }

  detachView(viewRootNodes: any[]): void {
    throw new Error('Not implemented');
  }

  destroyView(hostElement: any, viewAllNodes: any[]): void {
    throw new Error('Not implemented');
  }

  listen(renderElement: any, name: string, callback: Function): Function {
    throw new Error('Not implemented');
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    throw new Error('Not implemented');
  }

  setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void {
    throw new Error('Not implemented');
  }

  setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void {
    throw new Error('Not implemented');
  }

  setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void {
    throw new Error('Not implemented');
  }

  setElementClass(renderElement: any, className: string, isAdd: boolean): void {
    throw new Error('Not implemented');
  }

  setElementStyle(renderElement: any, styleName: string, styleValue: string): void {
    throw new Error('Not implemented');
  }

  invokeElementMethod(renderElement: any, methodName: string, args?: any[]): void {
    throw new Error('Not implemented');
  }

  setText(renderNode: any, text: string): void {
    throw new Error('Not implemented');
  }

  animate(element: any,
          startingStyles: AnimationStyles,
          keyframes: AnimationKeyframe[],
          duration: number,
          delay: number,
          easing: string,
          previousPlayers?: AnimationPlayer[]): AnimationPlayer {
    return new AnimationPlayerImpl();
  }
}