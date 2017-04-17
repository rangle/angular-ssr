import {Injectable, OnDestroy} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import {ConsoleLog, ConsoleType} from '../../snapshot';

import {baseConsole} from '../zone';

@Injectable()
export class ConsoleCollector implements OnDestroy {
  private readonly subject = new ReplaySubject<ConsoleLog>();

  public baseConsole = baseConsole;

  observable(): Observable<ConsoleLog> {
    return this.subject.asObservable();
  }

  assert(...args: Array<any>) {
    this.baseConsole.assert.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Assertion, args));
  }

  log(...args: Array<any>) {
    this.baseConsole.log.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Log, args));
  }

  warn(...args: Array<any>) {
    this.baseConsole.warn.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Warning, args));
  }

  error(...args: Array<any>) {
    this.baseConsole.error.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Error, args));
  }

  dir(...args: Array<any>) {
    this.baseConsole.dir.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.InteractiveObject, args));
  }

  time(...args: Array<any>) {
    this.baseConsole.time.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.Time, args));
  }

  timeEnd(...args: Array<any>) {
    this.baseConsole.timeEnd.apply(this.baseConsole, args);

    this.subject.next(createConsoleLog(ConsoleType.TimeEnd, args));
  }

  trace(...args: Array<any>) {
    this.baseConsole.trace.apply(this.baseConsole, args);

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