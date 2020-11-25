export const Ordering = { LT: -1, EQ: 0, GT: +1 } as const;
export type Ordering = typeof Ordering[keyof typeof Ordering];

export type Compare<T> = (a: T, b: T) => Ordering;

export function altOrdering<T>(...fns: Compare<T>[]): Compare<T> {
  return (a, b) => {
    let result: Ordering = Ordering.EQ;
    for (const fn of fns) {
      result = fn(a, b);
      if (result !== Ordering.EQ) break;
    }
    return result;
  };
}

export function compareDefault(a: string, b: string): Ordering;
export function compareDefault(a: number, b: number): Ordering;
export function compareDefault(a: any, b: any) {
  return a < b ? Ordering.LT : a > b ? Ordering.GT : Ordering.EQ;
}

export function compareUsing<T>(f: (_: T) => string | number): Compare<T> {
  return (a, b) => compareDefault(f(a) as any, f(b) as any);
}
