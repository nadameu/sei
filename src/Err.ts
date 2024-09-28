export class Err extends Error {
  name = 'Err';
}

export function isErr(value:unknown): value is Err{return value instanceof Err}

export function traverseErr<T, U>(xs: Iterable<T>, f: (x: T, index: number) => U | Err): U[] | Err {
  const ys: U[] = [];
  let i = 0;
  for (const x of xs) {
    const y = f(x, i++);
    if (y instanceof Err) return y;
    ys.push(y);
  }
  return ys
}
