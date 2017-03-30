declare const Zone;

export const forkZone = <R>(documentTemplate: string, requestUri: string, execute: () => R): R => {
  const zone = Zone.current.fork({
    name: requestUri,
    properties: {
      documentTemplate,
      requestUri,
    }
  });

  return zone.run(execute);
}
