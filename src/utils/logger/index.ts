import { pino } from 'pino';
import { envBoolean, envEnum } from '../env.ts';
import { makeErrorSerializer, serializeChain, toChainSlug } from './serializers.ts';
import type { LogScope, ResolveLogScope } from './types.ts';

const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
const level = envEnum('LOG_LEVEL', LEVELS, 'info');
const usePretty = process.env.NODE_ENV !== 'production' && !!process.stdout.isTTY;
const prettyStream = usePretty ? (await import('./pretty-transport.ts')).default() : undefined;
const cache = new Map<string, Logger>();
const serializeError = makeErrorSerializer({
  stack: envBoolean('LOG_ERROR_STACK', true),
  cause: envBoolean('LOG_ERROR_CAUSE', false),
  details: envBoolean('LOG_ERROR_DETAILS', false),
});

const rootLogger = pino(
  {
    level,
    base: null,
    serializers: {
      chain: serializeChain,
      err: serializeError,
      error: serializeError,
    },
  },
  prettyStream
);

type Logger = typeof rootLogger;

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
