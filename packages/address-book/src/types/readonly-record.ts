export type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};
