import {Node, SyntaxKind, forEachChild} from 'typescript';

export type NodeVisitor<T extends Node> = (node: T) => boolean;

export const traverse = <T extends Node>(root: Node, kind: SyntaxKind, visitor: NodeVisitor<T>): boolean => {
  if (kind === root.kind) {
    if (visitor(<T> root)) {
      return true;
    }
  }
  return forEachChild(root, node => traverse<T>(node, kind, visitor));
};
