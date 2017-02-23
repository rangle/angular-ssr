import {
  CallExpression,
  PropertyAccessExpression,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import {findExpression} from './expression';

import {ApplicationModuleDescriptor} from '../project';

export class StaticAnalyzer {
  constructor(private sources: Array<SourceFile>) {}

  getBootstrapModule(): ApplicationModuleDescriptor {
    for (const file of this.sources) {
      const expression = findExpression<CallExpression>(file, SyntaxKind.CallExpression, isBootstrapCall);
      if (expression) {
        return {source: file.fileName, symbol: expression.arguments[0].getText()}
      }
    }
    return null;
  }
}

const isBootstrapCall = (expr: CallExpression): boolean => {
  if (expr.expression.kind !== SyntaxKind.PropertyAccessExpression) {
    return false;
  }

  const accessor = <PropertyAccessExpression> expr.expression;
  if (accessor.name.kind !== SyntaxKind.Identifier ||
      accessor.expression == null ||
      accessor.expression.kind !== SyntaxKind.CallExpression) {
    return false;
  }

  switch (accessor.name.text) {
    case 'bootstrapModule':
    case 'bootstrapModuleFactory':
      return true;
    default:
      return false;
  }
};