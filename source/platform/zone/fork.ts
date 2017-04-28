export const forkZone = (documentTemplate: string, requestUri: string, properties?): Zone => {
  return Zone.current.fork({
    name: requestUri,
    properties: {
      documentTemplate,
      requestUri,
    },
    ...properties
  });
};

export const forkZoneExecute = <R>(documentTemplate: string, requestUri: string, execute: () => Promise<R>): Promise<R> => {
  let failure = (exception: Error) => true; // rethrow

  const zone = forkZone(documentTemplate, requestUri, {
    onHandleError: function (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error) {
      return failure(error);
    }
  });

  return new Promise((resolve, reject) => {
    failure = exception => {
      reject(exception);
      return false;
    };

    return zone.runGuarded(() => Promise.resolve(execute()).then(resolve).catch(reject)) as R;
  });
}
