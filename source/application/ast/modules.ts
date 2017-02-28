import {
  CallExpression,
  Identifier,
  Program,
  PropertyAccessExpression,
  SourceFile,
  SyntaxKind
} from 'typescript';

import {dirname, join, normalize} from 'path';

import {ApplicationModuleDescriptor} from './../project';

import {traverse} from './traverse';

export const discoverApplicationModule = (program: Program): ApplicationModuleDescriptor => {
  const bootstrap = 'bootstrapModule';
  const bootstrapFactory = 'bootstrapModuleFactory';
  const ngModule = 'NgModule';

  const expression = new RegExp(`(${bootstrap}|${bootstrapFactory}|${ngModule})`);

  for (const sourceFile of program.getSourceFiles()) {
    if (isExternal(sourceFile) || expression.test(sourceFile.text) === false) { // perf optimization
      continue;
    }

    const bootstrapIdentifier = traverse<string>(sourceFile, {
      [SyntaxKind.CallExpression]: (node: CallExpression) => {
        if (node.expression.kind !== SyntaxKind.PropertyAccessExpression) {
          return false;
        }
        const pae = <PropertyAccessExpression> node.expression;
        if (pae.name.kind !== SyntaxKind.Identifier) {
          return false;
        }
        switch (pae.name.text) {
          case bootstrap:
          case bootstrapFactory:
            if (node.arguments.length === 0 || node.arguments[0].kind !== SyntaxKind.Identifier) {
              break;
            }
            return (<Identifier> node.arguments[0]).text; // this will come after imports so we can short-circuit now
        }
        return false;
      },
    });

    if (bootstrapIdentifier != null) {
      for (const statement of sourceFile['imports']) {
        if (statement.parent == null ||
            statement.parent.importClause == null ||
            statement.parent.importClause.namedBindings == null) {
          continue;
        }
        for (const clause of statement.parent.importClause.namedBindings.elements || []) {
          if (clause.name.text === bootstrapIdentifier) {
            return {
              source: relativeImportPath(sourceFile.fileName, statement.text),
              symbol: clause.propertyName.text
            };
          }
        }
      }
    }
  }

  return null; // not found
};

const isExternal = (file: SourceFile): boolean => /(\\|\/)node_modules(\\|\/)/.test(file.fileName);

const relativeImportPath = (filename: string, relativePath: string) => normalize(join(dirname(filename), relativePath));