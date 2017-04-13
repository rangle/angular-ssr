import {spawn} from 'child_process';

export class HttpTestServer {
  constructor(serverUri: string) {}

  start() {
    return spawn('npm', ['run', 'start'], {shell: true});
  }
}
