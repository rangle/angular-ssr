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

      instance.stderr.pipe(process.stderr);

      instance.stdout.on('data',
        message => {
          process.stdout.write(message);

          if (expressions.failure.test(message.toString())) {
            reject(new Error('Server failed to start'));
          }

          if (expressions.success.test(message.toString())) {
            clearTimeout(timer);

            client.run().then(() => resolve()).catch(reject);
          }
        });
    });
  }
  finally {
    instance.kill();
  }
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch(exception => {
    console.error('Exception running system tests', exception);
  
    process.exit(1);
  });
  
const expressions = {failure: /app crashed/i, success: /Load https?:\/\/localhost/i};
