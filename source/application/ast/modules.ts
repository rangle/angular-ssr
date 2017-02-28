import {
  CallExpression,
  Identifier,
  Program,
  PropertyAccessExpression,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import {dirname, join, normalize} from 'path';

import {ApplicationModuleDescriptor} from './../project';

import {traverse} from './traverse';

import {DiscoveryException} from '../../exception';

import {
  bootstrap,
  bootstrapFactory,
  ngModuleDecorator
} from '../../identifiers';

export const discoverApplicationModule = (program: Program): ApplicationModuleDescriptor => {
  const expression = new RegExp(`(\.${bootstrap}|\.${bootstrapFactory}|\@${ngModuleDecorator})`);

  const candidates = new Array<ApplicationModuleDescriptor>();

  for (const sourceFile of program.getSourceFiles()) {
    if (isExternal(sourceFile) || expression.test(sourceFile.text) === false) { // broad filter, performance optimization
      continue;
    }

    const bootstrapIdentifiers = new Set<string>();

    traverse<CallExpression>(sourceFile, SyntaxKind.CallExpression,
      node => {
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
            bootstrapIdentifiers.add(defactory((<Identifier> node.arguments[0]).text));
        }
        return false;
      });

    for (const identifier of Array.from(bootstrapIdentifiers)) {
      const imported = importClause(sourceFile, identifier);
      if (imported) {
        candidates.push(imported);
      }
      else {
        const declaration = exportClause(sourceFile, identifier);
        if (declaration) {
          invalidPairing(sourceFile, identifier);
        }
      }
    }
  }

  switch (candidates.length) {
    case 0:
      throw new DiscoveryException('No root @NgModule discovered (an NgModule which is passed to a bootstrap function) (use the CLI or API options instead)');
    case 1:
      return candidates[0];
    default:
      throw new DiscoveryException(`Multiple root @NgModule discovered, cannot determine the correct one (${formatCandidates(candidates)})`);
  }
};

const exportClause = (sourceFile: SourceFile, identifier: string): ApplicationModuleDescriptor => {
  const exports: Map<string, any> = sourceFile['symbol'].exports;

  for (const exportIdentifier of Array.from(exports.keys())) {
    if (exportIdentifier === identifier) {
      return {
        source: sourceFile.fileName,
        symbol: exportIdentifier,
      };
    }
  }

  return null;
};

const importClause = (sourceFile: SourceFile, identifier: string): ApplicationModuleDescriptor => {
  for (const statement of sourceFile['imports']) {
    if (statement.parent == null ||
        statement.parent.importClause == null ||
        statement.parent.importClause.namedBindings == null) {
      continue;
    }
    for (const clause of statement.parent.importClause.namedBindings.elements || []) {
      if (defactory(clause.name.text) === identifier) {
        return {
          source: relativeImportPath(sourceFile.fileName, statement.text),
          symbol: clause.propertyName.text
        };
      }
    }
  }
  return null;
};

const defactory = (identifier: string) => identifier.replace(/NgFactory/, String());

const isExternal = (file: SourceFile): boolean => /(\\|\/)node_modules(\\|\/)/.test(file.fileName);

const relativeImportPath = (filename: string, relativePath: string) => normalize(join(dirname(filename), relativePath));

const formatCandidates = (candidates: Array<ApplicationModuleDescriptor>) => candidates.map(m => `${m.symbol} in ${m.source}`).join(', and ');

const invalidPairing = (sourceFile: SourceFile, identifier: string): void => {
  const descriptions = [
    'Pairing bootstrapModule or bootstrapModuleFactory with the root @NgModule in the same file will not work',
    'Otherwise it is impossible to import that module without bootstrapping the application',
    `You must extract "${identifier}" from ${sourceFile.fileName} and export it from a separate file for this to work`
  ];
  throw new DiscoveryException(descriptions.join('. '));
};