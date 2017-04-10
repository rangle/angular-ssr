export const forkZone = <R>(documentTemplate: string, requestUri: string, execute: () => Promise<R>): Promise<R> => {
  return new Promise((resolve, reject) => {
    const zone = Zone.current.fork({
      name: requestUri,
      properties: {
        documentTemplate,
        requestUri,
      },
      onHandleError: function (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error) {
        reject(error);

        return false;
      }
    });

    return zone.runGuarded(() => {
      execute().then(r => resolve(r)).catch(exception => reject(exception));
    }) as R;
  });
}
