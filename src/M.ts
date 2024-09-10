abstract class ResultBase<A, E> {}
export type Result<A, E> = Ok<A> | Err<E>;
class Ok<A> extends ResultBase<A, never> {
  constructor(public value: A) {
    super();
  }
}
export function ok<A, E = never>(value: A): Result<A, E> {
  return new Ok(value);
}
export function isOk<A, E>(result: Result<A, E>): result is Ok<A> {
  return result instanceof Ok;
}
class Err<E> extends ResultBase<never, E> {
  constructor(public reason: E) {
    super();
  }
}
export function err<E, A = never>(reason: E): Result<A, E> {
  return new Err(reason);
}
export function isErr<A, E>(result: Result<A, E>): result is Err<E> {
  return result instanceof Err;
}
export function tryCatch<A, E = unknown>(
  fn: () => A,
  recover?: (error: unknown) => Result<A, E>,
): Result<A, E> {
  try {
    return ok(fn());
  } catch (e) {
    if (recover) return recover(e);
    return err(e as E);
  }
}
type Traversed<
  R extends Result<unknown, unknown>[],
  As extends unknown[] = [],
  Es = never,
> = R extends []
  ? Result<As, Es>
  : R extends [Result<infer A, infer E>, ...infer Rest extends Result<unknown, unknown>[]]
    ? Traversed<Rest, [...As, A], Es | E>
    : R extends Result<infer A, infer E>[]
      ? Result<[...As, ...A[]], Es | E>
      : never;
export function all<const R extends Result<unknown, unknown>[]>(results: R): Traversed<R>;
export function all<A, E>(results: Result<A, E>[]): Result<A[], E> {
  return traverse(results, x => x);
}
export function traverse<A, B, E>(
  xs: Iterable<A>,
  f: (x: A, i: number) => Result<B, E>,
): Result<B[], E> {
  let result: B[] = [];
  let i = 0;
  for (const x of xs) {
    const fy = f(x, i++);
    if (fy instanceof Ok) {
      result.push(fy.value);
    } else {
      return fy;
    }
  }
  return ok(result);
}
export function chain<A, B, E2>(f: (_: A) => Result<B, E2>) {
  return <E1>(fa: Result<A, E1>): Result<B, E1 | E2> => {
    if (fa instanceof Ok) return f(fa.value);
    return fa;
  };
}
export function map<A, B>(f: (_: A) => B): <E>(fa: Result<A, E>) => Result<B, E> {
  return chain<A, B, never>(x => ok(f(x)));
}

type Measured<
  Ts extends ArrayLike<unknown>,
  N extends number,
  Result extends any[] = [],
> = number extends N
  ? {}
  : N extends Result['length']
    ? Record<
        { [K in keyof Result]: K }[Extract<keyof Result, number>],
        Ts extends ArrayLike<infer T> ? T : unknown
      >
    : Measured<Ts, N, [...Result, any]>;
export function hasLength<Ts extends ArrayLike<unknown>, N extends number>(
  obj: Ts,
  length: N,
): obj is Ts & Measured<Ts, N> {
  return obj.length === length;
}
