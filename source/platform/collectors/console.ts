import {Injectable, OnDestroy} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import {ConsoleLog, ConsoleType} from '../../snapshot';

import {baseConsole} from '../zone';

@Injectable()
export class ConsoleCollector implements OnDestroy {
  private subject = new ReplaySubject<ConsoleLog>();

  observable(): Observable<ConsoleLog> {
    return this.subject.asObservable();
  }

  assert(...args: Array<any>) {
    baseConsole.assert.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Assertion, args));
  }

  log(...args: Array<any>) {
    baseConsole.log.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Log, args));
  }

  warn(...args: Array<any>) {
    baseConsole.warn.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Warning, args));
  }

  error(...args: Array<any>) {
    baseConsole.error.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Error, args));
  }

  dir(...args: Array<any>) {
    baseConsole.dir.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.InteractiveObject, args));
  }

  time(...args: Array<any>) {
    baseConsole.time.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Time, args));
  }

  timeEnd(...args: Array<any>) {
    baseConsole.timeEnd.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.TimeEnd, args));
  }

  trace(...args: Array<any>) {
    baseConsole.trace.apply(baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Trace, args));
  }

  ngOnDestroy() {
    this.subject.complete();
    this.subject.unsubscribe();
  }
}

const createConsoleLog = (type: ConsoleType, args: Array<any>) => {
  const date = new Date();

  return {type, date, args};
}