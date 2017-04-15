export const templateDocument = `
  <!doctype html>
  <html>
    <head>
      <base href="/">
    </head>
    <body>
      <application></application>
    </body>
  </html>
`;

export const trimDocument = (doc: string | undefined): string => {
  return (doc || String()).trim().replace(/([\r\n\t ]{2,32})/g, ' ');
};
