import type { ApiChain } from '../chain';

export type LogScope = {
  /** top-level domain, e.g. 'apy', 'prices', 'tvl', 'zap', 'articles' */
  module: string;
  /** protocol / integration, e.g. 'curve', 'gamma', 'merkl' */
  platform?: string;
  /** chain slug or numeric chain id (normalized to the slug on the log line) */
  chain?: ApiChain | number;
};

export type ResolveLogScope = {
  module: LogScope['module'];
  platform?: LogScope['platform'];
  chain?: Exclude<LogScope['chain'], number>;
};
