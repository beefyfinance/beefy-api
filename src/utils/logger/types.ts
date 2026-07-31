import type { ApiChain } from '../chain.ts';

export type LogScope = {
  /** top-level domain, e.g. 'apy', 'prices', 'tvl', 'zap', 'articles' */
  module: string;
  /** named part of the module: an integration ('curve', 'merkl') or a sub-piece ('price-ranges', 'meta') */
  component?: string;
  /** chain slug or numeric chain id (normalized to the slug on the log line) */
  chain?: ApiChain | number;
};

export type ResolveLogScope = {
  module: LogScope['module'];
  component?: LogScope['component'];
  chain?: Exclude<LogScope['chain'], number>;
};
