import { envBoolean, envEnum, envNumber } from './env.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'timing' });

const TRACING_ENABLED = envBoolean('TRACING_ENABLED', false);
const TRACING_SLOW_MIN = envNumber('TRACING_SLOW_MS', 30_000);
const TRACING_MODES = ['slow', 'elapsed', 'always'] as const;
const TRACING_MODE = envEnum('TRACING_MODE', TRACING_MODES, 'slow');

type WithTracingOptions<TArgs extends unknown[]> = {
  logger?: typeof logger;
  fieldsFn?: (...args: TArgs) => Record<string, unknown>;
  mode?: 'slow' | 'elapsed' | 'always';
};

export function withTracing<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: WithTracingOptions<TArgs> = {}
): typeof fn {
  if (!TRACING_ENABLED) {
    return fn;
  }

  const localLogger = options.logger ?? logger;
  const mode = options.mode ?? TRACING_MODE;
  const getFields = (args: TArgs, extra?: Record<string, unknown>) => ({
    ...(!options.logger && { component: fn.name || 'anonymous' }),
    ...(!!options.fieldsFn && options.fieldsFn(...args)),
    ...extra,
  });

  return async (...args: TArgs) => {
    const start = performance.now();
    try {
      if (mode === 'always') {
        localLogger.debug(getFields(args), 'start');
      }
      return await fn(...args);
    } finally {
      const elapsed = Math.round(performance.now() - start);
      if (mode === 'slow') {
        if (elapsed >= TRACING_SLOW_MIN) {
          localLogger.warn(getFields(args, { elapsed }), 'end');
        }
      } else {
        localLogger[elapsed >= TRACING_SLOW_MIN ? 'warn' : 'debug'](getFields(args, { elapsed }), 'end');
      }
    }
  };
}
