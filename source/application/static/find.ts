import {
  Identifier,
  ImportDeclaration,
  NamedImports,
  SourceFile,
  SyntaxKind
} from 'typescript';

import {dirname, relative, resolve} from 'path';

import {ModuleDeclaration} from '../project';

import {traverse} from './traverse';

export const exportClause = (basePath: string, sourceFile: SourceFile, identifier: string): ModuleDeclaration => {
  const exports: Map<string, any> = sourceFile['symbol'].exports;

  for (const exportIdentifier of Array.from(exports.keys())) {
    if (exportIdentifier === identifier) {
      return {
        source: relative(basePath, sourceFile.fileName),
        symbol: exportIdentifier,
      };
    }
  }

  return null;
};

export const importClause = (basePath: string, sourceFile: SourceFile, identifier: string): ModuleDeclaration => {
  let result: ModuleDeclaration;

  traverse<ImportDeclaration>(sourceFile, SyntaxKind.ImportDeclaration,
    node => {
      if (node.importClause == null ||
          node.importClause.namedBindings == null) {
        return false;
      }

      const bindings: NamedImports = node.importClause.namedBindings as any;

      for (const clause of bindings.elements || []) {
        if (clause.name == null) {
          continue;
        }

        if ((clause.propertyName && clause.propertyName.text === identifier) || clause.name.text === identifier) {
          result = {
            source: relativeImportPath(basePath, sourceFile.fileName, (<Identifier>node.moduleSpecifier).text),
            symbol: (clause.propertyName && clause.propertyName.text) || clause.name.text,
            alias: clause.name.text
          };
          return true;
        }
      }
      return false;
    });

  return result;
};

const relativeImportPath = (basePath: string, filename: string, relativePath: string) => {
  return relative(basePath, resolve(dirname(filename), relativePath));
};