import {HttpTestClient} from './client';
import {HttpTestServer} from './server';

import {timeout, testUri} from './environment';

const server = new HttpTestServer(testUri);

const client = new HttpTestClient(testUri);

const run = async () => {
  const instance = server.start();
  try {
    await new Promise<void>((resolve, reject) => {
      instance.on('close', code => {
        if (code !== 0) {
          reject(new Error(`Server process exited with nonzero code ${code}`));
        }
      });

      const timer = setTimeout(() => reject(new Error('Timed out waiting for the server to start')), timeout);

      instance.stdout.on('data',
        message => {
          process.stdout.write(message);

          if (isServerRunning(message.toString())) {
            clearTimeout(timer);

            client.run().then(() => resolve()).catch(reject);
          }
        });
    });
  }
  finally {
    instance.kill();
  }

  process.exit(process.exitCode);
};

run().catch(exception => {
  console.error('Exception running system tests', exception);

  process.exitCode = 1;
});

const isServerRunning = (message: string) => /Load https?:\/\/localhost/.test(message);
