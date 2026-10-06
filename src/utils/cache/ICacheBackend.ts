export type CacheSetOptions = {
  /** best-effort hint, backends may ignore it; `get` always returns the original string */
  compress?: boolean;
};

export interface ICacheBackend {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
}
