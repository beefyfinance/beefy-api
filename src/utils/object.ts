export type OptionalRecord<TKeys extends string | number, TValue> = {
  [K in TKeys]?: TValue;
};

type OnlyIterable<T> = {
  [K in keyof T as K extends string ? K : K extends number ? string : never]: T[K];
};

type TypedEntries<T> = Array<[keyof OnlyIterable<T>, OnlyIterable<T>[keyof OnlyIterable<T>]]>;

export function typedEntries<TEntry extends {}>(entry: TEntry): TypedEntries<TEntry> {
  return Object.entries(entry) as TypedEntries<TEntry>;
}

type TypedKeys<T> = Array<keyof OnlyIterable<T>>;

export function typedKeys<TEntry extends {}>(entry: TEntry): TypedKeys<TEntry> {
  return Object.keys(entry) as TypedKeys<TEntry>;
}

export type TypedOmit<TEntry, TKeys extends keyof TEntry> = {
  [K in keyof TEntry as K extends TKeys ? never : K]: TEntry[K];
};

export function typedOmit<TEntry, TKeys extends keyof TEntry>(
  entry: TEntry,
  ...keys: TKeys[]
): TypedOmit<TEntry, TKeys> {
  return Object.fromEntries(
    Object.entries(entry).filter(([key]) => !keys.includes(key as TKeys))
  ) as TypedOmit<TEntry, TKeys>;
}
