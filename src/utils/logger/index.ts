import { pino } from 'pino';
import { type ApiChain, fromChainNumber } from '../chain.ts';
import type { LogScope, ResolveLogScope } from './types.ts';

const LEVELS = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);
const requested = process.env.LOG_LEVEL ?? 'info';
const level = LEVELS.has(requested) ? requested : 'info';
const usePretty = process.env.NODE_ENV !== 'production' && !!process.stdout.isTTY;
const prettyStream = usePretty ? (await import('./pretty-transport.ts')).default() : undefined;
const cache = new Map<string, Logger>();

const rootLogger = pino(
  {
    level,
    serializers: {
      chain: (v: unknown): unknown => {
        if (typeof v === 'number' || isIntegerString(v)) {
          return toChainSlug(Number(v));
        }
        return v;
      },
    },
  },
  prettyStream
);

type Logger = typeof rootLogger;

function isIntegerString(v: unknown) {
  return typeof v === 'string' && v.match(/^[0-9]+$/);
}

function toChainSlug(chain: ApiChain | number): ApiChain | undefined {
  return typeof chain === 'number' ? fromChainNumber(chain) : chain;
}

function buildKey(head: string, ...tails: (string | undefined)[]): string {
  return [head, ...tails].filter(Boolean).join(':');
}

/**
 * Create a scoped child logger. Bindings appear as structured fields on every line, so logs can be
 * filtered by `module` / `component` / `chain`.
 *
 * @example
 *   const logger = getLoggerFor({ module: 'apy', component: 'curve' });
 *   // inside a per-chain function, add the chain for that call:
 *   const chainLogger = getLoggerFor({ module: 'apy', component: 'curve', chain });
 *   chainLogger.warn({ vault: pool.oracleId, err }, 'apr calculation failed');
 */
export function getLoggerFor(scope: LogScope) {
  const chain = scope.chain === undefined ? undefined : toChainSlug(scope.chain);
  const key = buildKey(scope.module, scope.component, chain);
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }
  const bindings: ResolveLogScope = { module: scope.module };
  if (scope.component) {
    bindings.component = scope.component;
  }
  if (chain) {
    bindings.chain = chain;
  }
  const logger = rootLogger.child(bindings);
  cache.set(key, logger);
  return logger;
}
