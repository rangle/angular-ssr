const fetch = require('node-fetch');

const domino = require('domino');

export class HttpTestClient {
  constructor(private serverUri: string) {}

  async run(): Promise<void> {
    const response = await fetch(this.serverUri);

    if (response.ok === false) {
      throw new Error(`Server returned an HTTP response status code indicating failure: ${response.status}`);
    }

    const text = await response.text();

    assertions(text);

    console.log(`Test assertions all passed!`);
  }
}

const assertions = (text: string) => {
  const window = domino.createWindow(text, this.serverUri);

  const {document} = window;

  if (document.head == null || document.body == null) {
    throw new Error(`Unable to parse HTML response: ${text}`);
  }

  const application = document.querySelector('application');
  if (application == null) {
    throw new Error(`Cannot find root element <application> in document: ${text}`);
  }

  const scripts = Array.from<HTMLScriptElement>(document.querySelectorAll('script[type="text/javascript"]'));

  if (scripts.some(s => /prebootstrap\(\).init\(/.test(s.textContent)) === false) {
    throw new Error(`HTML document is missing preboot script: ${text}`);
  }

  if (scripts.some(s => /\/app.js/.test(s.src)) === false) {
    throw new Error(`HTML document is missing client-side script bundle in <script> tag: ${text}`);
  }

  if (/This is blog ID/i.test(application.textContent) === false) {
    throw new Error(`Server returned a document that does not contain the rendered blog element: ${text}`);
  }
};