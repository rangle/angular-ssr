import {
  AnimationPlayer,
  AnimationStyles,
  AnimationKeyframe,
  Renderer,
  RenderComponentType,
  APP_ID,
  Inject,
  Injectable,
  OnDestroy,
  RootRenderer,
  ViewEncapsulation,
} from '@angular/core';

import {NoOpAnimationPlayer} from '@angular/core/src/animation/animation_player';

import {namespaces} from './namespace';
import {DocumentContainer} from '../document';
import {SharedStylesToStyleTags} from '../styles';
import {RendererException} from '../../exception';
import {flatten} from '../../transformation';

@Injectable()
export class RootRendererImpl implements RootRenderer, OnDestroy {
  private components = new Map<string, Renderer>();

  constructor(
    @Inject(APP_ID) private applicationId: string,
    private container: DocumentContainer,
    private sharedStyles: SharedStylesToStyleTags
  ) {}

  get document(): Document {
    return this.container.document;
  }

  get window(): Window {
    return this.container.window;
  }

  renderComponent(component: RenderComponentType): Renderer {
    return this.components.get(component.id) || this.renderFactory(component);
  }

  ngOnDestroy() {
    this.components.clear();
  }

  private renderFactory(component: RenderComponentType): Renderer {
    const renderer = new RendererImpl(
      this.sharedStyles,
      this,
      component,
      `${this.applicationId}-${component.id}`);

    this.components.set(component.id, renderer);

    return renderer;
  }
}

export class RendererImpl implements Renderer {
  constructor(
    private styleMapper: SharedStylesToStyleTags,
    private root: RootRendererImpl,
    private component: RenderComponentType,
    private componentId: string,
  ) {
    this.styles = flatten<string>(component.styles).map(s => s.replace(/%COMP%/g, componentId));

    switch (component.encapsulation) {
      case ViewEncapsulation.Native:
        break;
      default:
        styleMapper.addStyles(this.styles);
        break;
    }
  }

  private styles: Array<string>;

  selectRootElement(selectorOrNode: string | any, debugInfo?) {
    const element: Element =
      typeof selectorOrNode === 'string'
        ? this.root.document.querySelector(selectorOrNode)
        : selectorOrNode;

    if (element == null) {
      throw new RendererException(`Cannot find root element (${selectorOrNode})`);
    }

    for (let i = element.childNodes.length; i > 0; --i) {
      element.removeChild(element.childNodes[i - 1]);
    }

    return element;
  }

  private createNamespacedElement(name: string): Element {
    const [namespace, nsname] = name.match(/^:([^:]+):(.+)$/).slice(1);

    return this.root.document.createElementNS(namespaces.get(namespace), nsname);
  }

  createElement(parentElement: Element | DocumentFragment, name: string, debugInfo?) {
    const element =
      /^\:/.test(name)
        ? this.createNamespacedElement(name)
        : this.root.document.createElement(name);

    if (this.contentIdentifier) {
      element.setAttribute(this.contentIdentifier, String());
    }

    if (parentElement != null) {
      parentElement.appendChild(element);
    }

    return element;
  }

  createViewRoot(hostElement: Element) {
    switch (this.component.encapsulation) {
      case ViewEncapsulation.Native:
        const fragment = this.root.document.createDocumentFragment();

        this.styleMapper.addHost(fragment);

        for (const style of this.styles) {
          const element = document.createElement('style');
          element.textContent = style;
          fragment.appendChild(element);
        }
        return fragment;

      default:
        if (this.hostIdentifier != null) {
          hostElement.setAttribute(this.hostIdentifier, String());
        }
        return hostElement;
    }
  }

  createTemplateAnchor(parentElement: Element | DocumentFragment, debugInfo?) {
    const comment = this.root.document.createComment('template bindings={}');

    if (parentElement != null) {
      parentElement.appendChild(comment);
    }

    return comment;
  }

  createText(parentElement: Element | DocumentFragment, value: string, debugInfo?) {
    const node = this.root.document.createTextNode(value);

    if (parentElement != null) {
      parentElement.appendChild(node);
    }

    return node;
  }

  projectNodes(parentElement: Element | DocumentFragment, nodes: Node[]): void {
    for (const node of nodes || []) {
      parentElement.appendChild(node);
    }
  }

  attachViewAfter(node: Node, viewRootNodes: Array<Node>): void {
    const parent = node.parentNode;
    if (parent == null || viewRootNodes.length === 0) {
      return;
    }

    const nextSibling = node.nextSibling;
    if (nextSibling != null) {
      for (const node of viewRootNodes) {
        parent.insertBefore(node, nextSibling);
      }
    }
    else {
      for (const node of viewRootNodes) {
        parent.appendChild(node);
      }
    }
  }

  detachView(viewRootNodes: Array<Node>): void {
    for (const node of viewRootNodes) {
      if (node.parentNode != null) {
        node.parentNode.removeChild(node);
      }
    }
  }

  destroyView(hostElement: Element | DocumentFragment, viewAllNodes: Array<Node>): void {
    switch (this.component.encapsulation) {
      case ViewEncapsulation.Native:
        if (hostElement != null) {
          this.styleMapper.removeHost(hostElement);
        }
      default:
        break;
    }
  }

  listen(renderElement: Element, name: string, callback: (event: Event) => boolean | void): Function {
    const bound = this.bindCallback(callback);

    renderElement.addEventListener(name, bound);

    return () => {
      renderElement.removeEventListener(name, bound);
    };
  }

  listenGlobal(target: string, name: string, callback: (event: Event) => boolean | void): Function {
    const bound = this.bindCallback(callback);

    let eventTarget: EventTarget;
    switch (target) {
      case 'document':
        eventTarget = this.root.document;
        break;
      case 'window':
        eventTarget = this.root.window;
        break;
      default:
        throw new RendererException(`Unknown global event target: ${target}`);
    }

    eventTarget.addEventListener(name, bound);

    return () => eventTarget.removeEventListener(name, bound);
  }

  setElementProperty(renderElement: Element | DocumentFragment, propertyName: string, propertyValue: any): void {
    renderElement[propertyName] = propertyValue;
  }

  setElementAttribute(renderElement: Element, attributeName: string, attributeValue: string): void {
    if (/^\:/.test(attributeName)) {
      const [namespace, attrname] = attributeName.match(/^:([^:]+):(.+)$/).slice(1);

      const ns = namespaces.get(namespace);

      if (attributeValue != null) {
        renderElement.setAttributeNS(ns, `${namespace}:${attrname}`, attributeValue);
      }
      else {
        renderElement.removeAttributeNS(ns, attrname);
      }
    }
    else {
      if (attributeValue != null) {
        renderElement.setAttribute(attributeName, attributeValue);
      }
      else {
        renderElement.removeAttribute(attributeName);
      }
    }
  }

  setBindingDebugInfo(renderElement: Element, propertyName: string, propertyValue: string): void {
    switch (renderElement.nodeType) {
      case Node.COMMENT_NODE:
        const bindings = renderElement.nodeValue.replace(/[\r\n]/g, '').match(/^template bindings=(.*)$/);
        const parsedBindings = JSON.parse(bindings[1]);
        parsedBindings[propertyName] = propertyValue;
        renderElement.nodeValue = `template bindings=${JSON.stringify(parsedBindings, null, 2)}`;
        break;
      default:
        this.setElementAttribute(renderElement, propertyName, propertyValue);
        break;
    }
  }

  setElementClass(renderElement: Element, className: string, isAdd: boolean): void {
    if (isAdd) {
      renderElement.classList.add(className);
    }
    else {
      renderElement.classList.remove(className);
    }
  }

  setElementStyle(renderElement, styleName: string, styleValue: string): void {
    renderElement.style[styleName] = styleValue;
  }

  invokeElementMethod(renderElement: Element | DocumentFragment, methodName: string, args?: any[]): void {
    renderElement[methodName].apply(renderElement, args);
  }

  setText(renderNode: Element | DocumentFragment, text: string): void {
    renderNode.nodeValue = text;
  }

  animate(element: any,
          startingStyles: AnimationStyles,
          keyframes: AnimationKeyframe[],
          duration: number,
          delay: number,
          easing: string,
          previousPlayers?: AnimationPlayer[]): AnimationPlayer {
    return new NoOpAnimationPlayer();
  }

  private get hostIdentifier(): string {
    if (this.component.encapsulation !== ViewEncapsulation.Emulated) {
      return null;
    }
    return `_nghost-${this.componentId}`;
  }

  private get contentIdentifier(): string {
    if (this.component.encapsulation !== ViewEncapsulation.Emulated) {
      return null;
    }
    return `_ngcontent-${this.componentId}`;
  }

  private bindCallback(eventHandler: (event: Event) => boolean | void): (event: Event) => void {
    return (event: Event) => {
      const allowDefaultBehavior = eventHandler(event);
      if (allowDefaultBehavior === false) {
        event.preventDefault();
        event.returnValue = false;
      }
    };
  }
}
