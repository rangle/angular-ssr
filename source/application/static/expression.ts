import {Node, SyntaxKind} from 'typescript';

export const findExpression = <N extends Node>(root: Node, kind: SyntaxKind, predicate: (node: N) => boolean): N => {
  const match = (n: Node) => n.kind === kind && predicate(n as N);

  if (match(root)) {
    return root as N;
  }

  for (const child of root.getChildren()) {
    if (match(child)) {
      return child as N;
    }

    const result = findExpression(child, kind, predicate);
    if (result) {
      return result;
    }
  }

  return null;
};