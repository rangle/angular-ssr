import {AnimationPlayer} from '@angular/core';

export type AnimationHandler = () => void;

export class AnimationPlayerImpl implements AnimationPlayer {
  private finishedHandlers = new Array<AnimationHandler>();

  private startedHandlers = new Array<AnimationHandler>();

  private started = false;

  public parentPlayer: AnimationPlayer = null;

  constructor() {
    setImmediate(() => this.finished());
  }

  private finished() {
    this.finishedHandlers.forEach(fn => fn());
    this.finishedHandlers = new Array<AnimationHandler>();
  }

  onStart = (fn: AnimationHandler) => this.startedHandlers.push(fn);

  onDone = (fn: AnimationHandler) => this.finishedHandlers.push(fn);

  setPosition = (p: number) => {}
  getPosition = (): number => 0;

  hasStarted = (): boolean => this.started;

  init() {}

  play() {
    if (this.hasStarted() === false) {
      this.startedHandlers.forEach(fn => fn());
      this.startedHandlers = new Array<AnimationHandler>();
    }
    this.started = true;
  }

  destroy() {}

  reset() {}

  pause() {}

  restart() {}

  finish() {
    this.finished();
  }
}