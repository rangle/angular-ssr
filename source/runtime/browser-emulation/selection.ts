export class Selection implements Selection {
  get anchorNode(): Node {
    return null;
  }

  get anchorOffset(): number {
    return 0;
  }

  get baseNode(): Node {
    return null;
  }

  get baseOffset(): number {
    return 0;
  }

  get extentNode(): Node {
    return null;
  }

  get extentOffset(): number {
    return 0;
  }

  get focusNode(): Node {
    return null;
  }

  get focusOffset(): number {
    return 0;
  }

  get isCollapsed(): boolean {
    return true;
  }

  get rangeCount(): number {
    return 0;
  }

  get type(): string {
    return 'None';
  }

  addRange(range: Range): void {}

  collapse(parentNode: Node, offset: number): void {}

  collapseToEnd(): void {}

  collapseToStart(): void {}

  containsNode(node: Node, partlyContained: boolean): boolean {
    return document.contains(node);
  }

  deleteFromDocument(): void {}

  empty(): void {}

  extend(newNode: Node, offset: number): void {}

  getRangeAt(index: number): Range {
    return new Range();
  }

  removeAllRanges(): void {}

  removeRange(range: Range): void {}

  selectAllChildren(parentNode: Node): void {}

  setBaseAndExtent(baseNode: Node, baseOffset: number, extentNode: Node, extentOffset: number): void {}

  setPosition(parentNode: Node, offset: number): void {}

  toString() {
    return String();
  }
}

const getSelection = () => new Selection();

export const bindSelection = targetWindow => ({getSelection});