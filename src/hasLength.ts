type Measured<
  Ts extends ArrayLike<unknown>,
  N extends number,
  Result extends any[] = [],
> = number extends N
  ? Ts
  : N extends Result['length']
  ? Ts & Record<
    Exclude<keyof Result, keyof []>,
    Ts extends ArrayLike<infer T> ? T : unknown
  >
  : Measured<Ts, N, [...Result, any]>;
export function hasLength<Ts extends ArrayLike<unknown>, N extends number>(
  obj: Ts,
  length: N,
): obj is Measured<Ts, N> {
  return obj.length === length;
}
