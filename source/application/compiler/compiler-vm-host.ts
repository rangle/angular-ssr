import {cwd} from 'process';

import {
  SourceFile,
  ScriptTarget,
  CompilerHost,
  ParsedCommandLine,
  createSourceFile,
  parseJsonConfigFileContent,
  readConfigFile,
} from 'typescript';

const {matchFiles} = require('typescript'); // does not exist in definition

import {DelegatingHost} from '@angular/tsc-wrapped/src/compiler_host';

import {TraverseFilesystem, fileContent} from 'filesystem';

import {VirtualMachine} from './vm';

import {Project} from '../project';

export class CompilerVmHost extends DelegatingHost {
  public parsedCommandLine: ParsedCommandLine;

  constructor(
    private project: Project,
    private vm: VirtualMachine,
    private host: CompilerHost
  ) {
    super(host);

    this.parsedCommandLine = this.loadOptions();
  }

  private loadOptions(): ParsedCommandLine {
    const {config} = readConfigFile(this.project.tsconfig, fileContent);

    const host = {
      useCaseSensitiveFileNames: true,
      fileExists: this.fileExists,
      readDirectory: this.readDirectory,
      readFile: this.readFile,
    };

    return parseJsonConfigFileContent(config, host, this.project.basePath, {exclude: ['node_modules']});
  }

  readDirectory = (path: string, extensions: Array<string>, excludes: Array<string | RegExp>, includes: Array<string | RegExp>): Array<string> => {
    const traverse = (dir: string) => {
      const traversal = new TraverseFilesystem(dir);

      const files = traversal.files();

      for (const vmf of Array.from(this.vm.filenames(dir))) {
        files.add(vmf);
      }

      const directories = traversal.directories();

      for (const vmdir of Array.from(this.vm.directories(dir))) {
        directories.add(vmdir);
      }

      return {files: Array.from(files), directories: Array.from(directories)};
    };

    return matchFiles(path, extensions, excludes, includes, false, cwd(), traverse);
  };

  // getScriptSnapshot = (filename: string): IScriptSnapshot => {
  //   let sf = (<{getScriptSnapshot?}>this.host).getScriptSnapshot(filename);
  //   if (sf == null) {
  //     sf = ScriptSnapshot.fromString(this.readFile(filename));
  //   }
  //   return sf;
  // };

  getSourceFile = (filename: string, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile => {
    const content = this.vm.read(filename);
    if (content) {
      return createSourceFile(filename, content, languageVersion, true);
    }
    return this.host.getSourceFile(filename, languageVersion, onError);
  };

  readFile = (filename: string): string => {
    return this.vm.read(filename) || this.delegate.readFile(filename);
  };

  getDirectories = (path: string): Array<string> => {
    const directories = this.vm.directories(path);

    for (const realpath of this.host.getDirectories(path)) {
      directories.add(realpath);
    }

    return Array.from(directories);
  };

  fileExists = (filename: string): boolean => {
    return this.vm.filenames().has(filename) || this.host.fileExists(filename);
  };

  directoryExists = (directoryName: string): boolean => {
    return this.vm.directories().has(directoryName) || this.host.directoryExists(directoryName);
  };
}
