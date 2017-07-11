import {Observable, Subscription} from 'rxjs';

import 'zone.js';

import {RuntimeException} from '../../exception';

export const scheduleTask = <T>(execute: () => Observable<T>, description?: string): Observable<T> => {
  let subscription: Subscription;

  return new Observable<T>(observer => {
    let result: T | Error;

    const scheduleTask = (task: Task) => {
      subscription = execute().subscribe(
        value => {
          result = value;
          task.invoke();
        },
        error => {
          result = new RuntimeException(`Task failure: ${description}`, error);
        },
        () => task.invoke());
    };

    const complete = () => {
      if (result instanceof Error) {
        observer.error(result as Error);
      }
      else {
        observer.next(result);
        observer.complete();
      }
    };

    Zone.current.scheduleMacroTask('wrapped task', complete, null, scheduleTask, subscription.unsubscribe.bind(subscription));
  });
};
