import {join} from 'path';

import {FileType} from '../type';
import {fileFromString, pathFromString, pathFromRandomId} from '../factories';
import {randomId} from '../../identifiers';

describe('filesystem', () => {
  it('can create a file with text content', () => {
    const path = pathFromRandomId();
    path.mkdir();
    try {
      const file = fileFromString(join(path.toString(), randomId()));
      file.create('Hello World');
      try {
        expect(file.content()).toBe('Hello World');
      }
      finally {
        file.unlink();
      }
    }
    finally {
      path.unlink();
    }
  });

  it('can determine whether a file exists', () => {
    const file = fileFromString(__filename);
    expect(file.exists()).toBe(true);
  });

  it('can determine the type of a file or path', () => {
    const path = pathFromString(__dirname);
    const file = fileFromString(__filename);
    expect(path.type()).toEqual(FileType.Directory);
    expect(file.type()).toEqual(FileType.File);
  });
});