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
  let ret: A[] = [];
  for (const result of results) {
    if (result instanceof Ok) {
      ret.push(result.value);
    } else {
      return result;
    }
  }
  return ok(ret);
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