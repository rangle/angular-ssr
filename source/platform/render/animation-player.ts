import {AnimationPlayer} from '@angular/core/index';

export type AnimationHandler = () => void;

export class AnimationPlayerImpl implements AnimationPlayer {
  private finishedHandlers = new Array<AnimationHandler>();

  private startedHandlers = new Array<AnimationHandler>();

  private started = false;

  parentPlayer: AnimationPlayer = null;

  constructor() {
    setImmediate(() => this.finished());
  }

  private finished() {
    this.finishedHandlers.forEach(fn => fn());
    this.finishedHandlers.splice(0, this.finishedHandlers.length);
  }

  onStart = (fn: AnimationHandler) => this.startedHandlers.push(fn);

  onDone = (fn: AnimationHandler) => this.finishedHandlers.push(fn);

  private position: number;

  setPosition = (p: number) => {
    this.position = p;
  }

  getPosition = (): number => this.position;

  hasStarted = (): boolean => this.started;

  init() {}

  play() {
    if (this.hasStarted() === false) {
      this.startedHandlers.forEach(fn => fn());
      this.startedHandlers.splice(0, this.startedHandlers.length);
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