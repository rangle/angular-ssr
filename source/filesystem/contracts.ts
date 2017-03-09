import {Predicate} from '../predicate';

import {FilesystemType} from './type';

export interface FilesystemBase {
  // The name of this item (just the name)
  name(): string;

  // The parent directory containing this element
  parent(): PathReference;

  // The type of path this is (symbolic link, etc.)
  type(): FilesystemType;

  // Does this path exist?
  exists(): boolean;
}

export interface FileReference extends FilesystemBase {
  dereference(): FileReference;

  // Create or overwrite the file with this content
  create(content: string): void;

  // Read the content of this file as a UTF8 string
  content(): string;

  // Delete this file or fail silently in case of failure
  unlink(): void;
}

export interface PathReference extends FilesystemBase {
  dereference(): PathReference;

  // Get the immediate descendant child directories
  directories(predicate?: RegExp | Predicate<PathReference>): Set<PathReference>;

  // Immediate descendant child files
  files(predicate?: RegExp | Predicate<FileReference>): Set<FileReference>;

  // Traverse upward looking for a particular file (throws if not found)
  findInAncestor(file: string): FileReference;

  // Recursive create of each component of the path (if nonexistent)
  mkdir(): void;
}
