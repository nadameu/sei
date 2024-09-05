export interface Serializable<T> {
  parse(representation: string): { valid: true; value: T } | { valid: false };
  serialize(value: T): string;
}
