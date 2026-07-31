import { resolve } from 'node:path';
import { BaseError } from 'viem';
import { isDefined } from '../array.ts';
import { type ApiChain, fromChainNumber } from '../chain.ts';

const rootDir = resolve(import.meta.dirname, '../../..');

function isIntegerString(v: unknown) {
  return typeof v === 'string' && v.match(/^[0-9]+$/);
}

export function toChainSlug(chain: ApiChain | number): ApiChain | undefined {
  return typeof chain === 'number' ? fromChainNumber(chain) : chain;
}

export function serializeChain(v: unknown): unknown {
  if (typeof v === 'number' || isIntegerString(v)) {
    return toChainSlug(Number(v));
  }
  return v;
}

function isError(v: unknown): v is Error {
  return !!v && v instanceof Error;
}

type ErrorWithCode = Error & { code: number | string };
const validCodeTypes = new Set(['string', 'number']);
function isErrorWithCode(v: unknown): v is ErrorWithCode {
  if (isError(v)) {
    return 'code' in v && validCodeTypes.has(typeof v.code);
  }
  return false;
}

function getErrorType(err: Error): string {
  const type = err.name || 'Error';
  if (type === 'Error' && err.constructor.name) {
    return err.constructor.name;
  }
  return type;
}

type SerializedError = {
  type: string;
  message: string;
  code?: number | string;
  stack?: string;
  cause?: SerializedError;
  details?: string;
  errors?: SerializedError[];
};

function serializeViemError(err: BaseError, { stack, details }: ErrorSerializerConfig): SerializedError {
  const serialized: SerializedError = {
    type: getErrorType(err),
    message: err.shortMessage || err.message.split('\n')[0],
  };

  if (isErrorWithCode(err)) {
    serialized.code = err.code;
  }

  if (stack && err.stack) {
    serialized.stack = err.stack.replace(err.message, '').replaceAll(rootDir, '.');
  }

  if (details && err.details) {
    serialized.details = err.details;
  }

  return serialized;
}

function serializeStandardError(err: Error, { stack }: ErrorSerializerConfig): SerializedError {
  const serialized: SerializedError = {
    type: getErrorType(err),
    message: err.message,
  };

  if (isErrorWithCode(err)) {
    serialized.code = err.code;
  }

  if (stack && err.stack) {
    serialized.stack = err.stack.replaceAll(rootDir, '.');
  }

  return serialized;
}

const defaultErrorSerializerOptions: ErrorSerializerConfig = {
  cause: false,
  stack: false,
  details: false,
};

export type ErrorSerializerOptions = {
  cause?: boolean;
  stack?: boolean;
  details?: boolean;
};

type ErrorSerializerConfig = Required<ErrorSerializerOptions>;

export function makeErrorSerializer(options: ErrorSerializerOptions) {
  const opts: ErrorSerializerConfig = {
    ...defaultErrorSerializerOptions,
    ...options,
  };

  const serializeOne = (err: Error): SerializedError => {
    if (err instanceof BaseError) {
      return serializeViemError(err, opts);
    }
    return serializeStandardError(err, opts);
  };

  const serialize = (err: unknown, seen: Set<unknown>): SerializedError | undefined => {
    if (isError(err)) {
      const serialized = serializeOne(err);
      seen.add(err);
      if (opts.cause) {
        if (err.cause && isError(err.cause) && !seen.has(err.cause)) {
          serialized.cause = serialize(err.cause, seen);
        }
        if (err instanceof AggregateError && err.errors.length) {
          serialized.errors = err.errors.map(e => serialize(e, seen)).filter(isDefined);
        }
      }
      return serialized;
    }

    return undefined;
  };

  return (v: unknown): unknown => {
    const seen = new Set();
    const serialized = serialize(v, seen);
    seen.clear();
    return serialized ?? v;
  };
}
