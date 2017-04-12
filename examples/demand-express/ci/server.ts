import {ChildProcess, spawn} from 'child_process';

export class HttpTestServer {
  constructor(serverUri: string) {}

  start() {
    return runService('npm run start');
  }
}

const runService = (command: string): ChildProcess => {
  const [script, ...args] = command.split(/\s/g).filter(v => v);

  const child = spawn(script, args, {shell: true});

  child.stderr.pipe(process.stderr);

  return child;
}
