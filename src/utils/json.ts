export function infinityToStringReplacer(_: string, value: unknown): unknown {
  if (value === Infinity) {
    return 'Infinity';
  }
  if (value === -Infinity) {
    return '-Infinity';
  }
  return value;
}
