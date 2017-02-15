import {Injectable} from '@angular/core';

@Injectable()
export class SharedStyles {
  private set = new Set<string>();

  protected handlers = new Set<(added: Set<string>) => void>();

  public get current(): Array<string> {
    return Array.from(this.set);
  }

  add(styles: Array<string>) {
    const added = new Set<string>(styles.filter(s => this.set.has(s) === false));

    for (const newStyle of Array.from(added)) {
      this.set.add(newStyle);
    }

    this.handlers.forEach(h => h(added));
  }

  bind(handler: (added: Set<string>) => void): () => void {
    this.handlers.add(handler);

    return () => this.handlers.delete(handler);
  }
}
