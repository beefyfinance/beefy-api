import {
  FetchBody,
  FetchParams,
  FetchParamsOptions,
  GetUrlSearchParamsRecord,
  GetUrlSearchParamsScalarsEntry,
  GetUrlSearchParamsValuesEntry,
  PassThroughBodyInit,
  PassThroughURLSearchParamsInit,
} from './types';
import { typedDefaultsDeep } from '../object';
import { URLSearchParams } from 'url';

export const ABORT_REASON_TIMEOUT = '__timeout';

const DEFAULT_NULL_STRING = 'null';
const DEFAULT_UNDEFINED_STRING = 'undefined';
const DEFAULT_FETCH_PARAMS_OPTIONS: FetchParamsOptions = {
  keepNull: false,
  keepUndefined: false,
};

export function getUrlSearchParams(
  params: GetUrlSearchParamsRecord,
  options?: FetchParamsOptions
): URLSearchParams {
  return new URLSearchParams(
    valuesToString(
      flattenArrayValues(Object.entries(params)),
      typedDefaultsDeep(options, DEFAULT_FETCH_PARAMS_OPTIONS)
    )
  );
}

function flattenArrayValues(
  entries: Array<GetUrlSearchParamsValuesEntry>
): Array<GetUrlSearchParamsScalarsEntry> {
  return entries.flatMap(
    ([k, v]): Array<GetUrlSearchParamsScalarsEntry> =>
      Array.isArray(v) ? v.map(i => [k, i]) : [[k, v]]
  );
}

function valuesToString(
  entries: Array<GetUrlSearchParamsValuesEntry>,
  options: FetchParamsOptions
): Array<[string, string]> {
  const { keepNull, keepUndefined } = options;

  if (keepNull === undefined || keepNull === false) {
    entries = entries.filter(([, v]) => v !== null);
  }
  if (keepUndefined === undefined || keepUndefined === false) {
    entries = entries.filter(([, v]) => v !== undefined);
  }

  const nullString = typeof keepNull === 'string' ? keepNull : DEFAULT_NULL_STRING;
  const undefinedString =
    typeof keepUndefined === 'string' ? keepUndefined : DEFAULT_UNDEFINED_STRING;

  return entries.map(([k, v]) => [
    k,
    v === null ? nullString : v === undefined ? undefinedString : v.toString(),
  ]);
}

export function isPassThroughURLSearchParamsInit(
  params: FetchParams
): params is PassThroughURLSearchParamsInit {
  if (!!params) {
    return false;
  }
  if (typeof params === 'string') {
    return true;
  }
  if (typeof params === 'object') {
    return Array.isArray(params) || params instanceof URLSearchParams;
  }
  return false;
}

export function isPassThroughBodyInit(body: FetchBody): body is PassThroughBodyInit {
  if (body === undefined) {
    return false;
  }
  if (body === null) {
    return true;
  }
  if (typeof body === 'string') {
    return true;
  }
  if (typeof body === 'object') {
    return (
      body instanceof ArrayBuffer ||
      body instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams
    );
  }
  return false;
}

/**
 * @param mode short: minutely / long: hourly
 */
export function getCacheBuster(mode: 'short' | 'long' = 'short'): string {
  const d = new Date();

  if (mode === 'long') {
    d.setMinutes(0, 0, 0);
  } else {
    d.setSeconds(0, 0);
  }

  return d.getTime().toString();
}

/** only sets if there is no Accept header */
export function setAcceptsIfMissing(headers: Headers, type: string): void {
  const existing = headers.get('Accept');
  if (!existing) {
    headers.set('Accept', type);
  }
}

/** @inheritdoc setAcceptsIfMissing */
export function setAcceptsJsonIfMissing(headers: Headers): void {
  setAcceptsIfMissing(headers, 'application/json, */*;q=0.8');
}

/** @inheritdoc setAcceptsIfMissing */
export function setAcceptsAnyIfMissing(headers: Headers): void {
  setAcceptsIfMissing(headers, '*/*');
}

/** only sets if there is no Content-Type header */
export function setContentTypeIfMissing(headers: Headers, type: string): void {
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', type);
  }
}

/** @inheritdoc setContentTypeIfMissing */
export function setContentTypeJsonIfMissing(headers: Headers): void {
  setContentTypeIfMissing(headers, 'application/json');
}
