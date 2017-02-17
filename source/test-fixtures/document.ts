export const templateDocument = `
  <!doctype html>
  <html>
    <head></head>
    <body>
      <application></application>
    </body>
  </html>
`;

export const trimDocument = (document: string): string => {
  return document.trim().replace(/([\r\n\t ]{2,32})/g, ' ');
};
