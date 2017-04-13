export class Range {
  constructor(
    private l?: number,
    private r?: number
  ) {}

  get collapsed(): boolean {
    return true;
  }

  get commonAncestorContainer(): Element {
    return document.body;
  }

  get startContainer(): Node {
    return document.body;
  }

  get endContainer(): Node {
    return document.body;
  }

  get startOffset(): number {
    return this.l || 0;
  }

  get endOffset(): number {
    return this.r || 0;
  }
}