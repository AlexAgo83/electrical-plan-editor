import { describe, expect, it } from "vitest";
import { MinHeap } from "../core/minHeap";

describe("MinHeap", () => {
  it("pops values in ascending order", () => {
    const heap = new MinHeap<number>((left, right) => left - right);

    heap.push(4);
    heap.push(1);
    heap.push(9);
    heap.push(2);

    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(4);
    expect(heap.pop()).toBe(9);
    expect(heap.pop()).toBeUndefined();
  });

  it("preserves comparator-based ordering for ties", () => {
    const heap = new MinHeap<{ cost: number; id: string }>((left, right) => {
      if (left.cost !== right.cost) {
        return left.cost - right.cost;
      }

      return left.id.localeCompare(right.id);
    });

    heap.push({ cost: 5, id: "z" });
    heap.push({ cost: 3, id: "b" });
    heap.push({ cost: 3, id: "a" });

    expect(heap.pop()).toEqual({ cost: 3, id: "a" });
    expect(heap.pop()).toEqual({ cost: 3, id: "b" });
    expect(heap.pop()).toEqual({ cost: 5, id: "z" });
  });
});
