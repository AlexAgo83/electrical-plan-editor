export class MinHeap<T> {
  private readonly values: T[] = [];

  constructor(private readonly compare: (left: T, right: T) => number) {}

  push(value: T): void {
    this.values.push(value);
    this.bubbleUp(this.values.length - 1);
  }

  pop(): T | undefined {
    if (this.values.length === 0) {
      return undefined;
    }

    const min = this.values[0];
    const last = this.values.pop();
    if (last !== undefined && this.values.length > 0) {
      this.values[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  size(): number {
    return this.values.length;
  }

  private bubbleUp(startIndex: number): void {
    let index = startIndex;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.values[index] as T, this.values[parentIndex] as T) >= 0) {
        break;
      }

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(startIndex: number): void {
    let index = startIndex;

    while (true) {
      const leftChildIndex = index * 2 + 1;
      const rightChildIndex = leftChildIndex + 1;
      let nextIndex = index;

      if (
        leftChildIndex < this.values.length &&
        this.compare(this.values[leftChildIndex] as T, this.values[nextIndex] as T) < 0
      ) {
        nextIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.values.length &&
        this.compare(this.values[rightChildIndex] as T, this.values[nextIndex] as T) < 0
      ) {
        nextIndex = rightChildIndex;
      }

      if (nextIndex === index) {
        return;
      }

      this.swap(index, nextIndex);
      index = nextIndex;
    }
  }

  private swap(leftIndex: number, rightIndex: number): void {
    const leftValue = this.values[leftIndex];
    this.values[leftIndex] = this.values[rightIndex] as T;
    this.values[rightIndex] = leftValue as T;
  }
}
