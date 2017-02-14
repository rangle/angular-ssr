import {Injectable} from '@angular/core';

@Injectable()
export class SharedStylesImpl {
  protected _stylesSet = new Set<string>();

  addStyles(styles: string[]): void {
    const additions = new Set<string>();

    styles.forEach(style => {
      if (!this._stylesSet.has(style)) {
        this._stylesSet.add(style);
        additions.add(style);
      }
    });

    this.onStylesAdded(additions);
  }

  onStylesAdded(additions: Set<string>): void {}

  getAllStyles(): string[] { return Array.from(this._stylesSet); }
}
