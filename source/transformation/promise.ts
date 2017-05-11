export const toPromise = <T>(fn: (callback: (error: Error | NodeJS.ErrnoException, result?: T) => void) => void): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    fn((error, result) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(result);
      }
    });
  });
};