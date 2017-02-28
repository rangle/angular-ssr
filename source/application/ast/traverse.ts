import {Node, forEachChild} from 'typescript';

type NodeVisitorMap = {
  [kind: number]: (node: Node) => any
};

export const traverse = <T>(fromRoot: Node, map: NodeVisitorMap): T => {
  if (map[fromRoot.kind]) {
    const r = map[fromRoot.kind](fromRoot);
    if (r) {
      return r as T;
    }
  }
  return forEachChild(fromRoot, node => traverse<T>(node, map));
};
