import {CloneException} from './exception';

export abstract class Clone {
  static facade<T, V>(obj: T, facade: V): T & V {
    const shallow = Object.assign({}, facade);

    Object.setPrototypeOf(shallow, obj);

    return <T & V> shallow;
  }

  static deep<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    switch (typeof obj) {
      case 'boolean':
      case 'function':
      case 'string':
      case 'number':
        return obj;
    }

    if (Array.isArray(obj)) {
      return <any> obj.map(v => Clone.deep(v));
    }
    else if (obj instanceof Set) {
      return new Set(Array.from(obj.entries()).map(v => Clone.deep(v))) as any;
    }
    else if (obj instanceof WeakSet) {
      throw new CloneException(obj, 'WeakSet objects cannot be cloned because WeakSet objects are not iterable');
    }
    else if (obj instanceof Map) {
      return new Map(Array.from(obj.entries()).map(([k, v]) => <[any, any]> [Clone.deep(k), Clone.deep(v)])) as any;
    }
    else if (obj instanceof WeakMap) {
      throw new CloneException(obj, 'WeakMap objects cannot be cloned because WeakMap objects are not iterable');
    }
    else {
      const cloned = Object.assign({}, obj);

      for (const k of Object.keys(cloned)) {
        cloned[k] = Clone.deep(cloned[k]);
      }

      Object.setPrototypeOf(cloned, Object.getPrototypeOf(obj));

      return cloned;
    }
  }
}