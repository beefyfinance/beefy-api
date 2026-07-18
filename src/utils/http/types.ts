import type { Blob } from 'node:buffer';
import type { URLSearchParams } from 'node:url';
import type { HeadersInit } from 'undici-types';

export type PassThroughHeadersInit =
  | [string,string][]
  | Record<string, string | ReadonlyArray<string>>
  | Headers;
export type PassThroughBodyInit = ArrayBuffer | Blob | FormData | URLSearchParams | null | string;

export type GetUrlSearchParamsScalars = string | number | boolean | null | undefined;
export type GetUrlSearchParamsValues = GetUrlSearchParamsScalars | Array<GetUrlSearchParamsScalars>;
export type GetUrlSearchParamsRecord = Record<string, GetUrlSearchParamsValues>;
export type GetUrlSearchParamsValuesEntry = [string, GetUrlSearchParamsValues];
export type GetUrlSearchParamsScalarsEntry = [string, GetUrlSearchParamsScalars];

export type PassThroughURLSearchParamsInit =
  | URLSearchParams
  | string
  | string[][];

export type FetchParams = PassThroughURLSearchParamsInit | GetUrlSearchParamsRecord;

export type FetchParamsOptions = {
  // keep params with null values as "null" or custom string
  keepNull?: boolean | string;
  // keep params with undefined values as "undefined" or custom string
  keepUndefined?: boolean | string;
};

export type FetchHeaders = HeadersInit;

export type FetchAbortSignal = { signal?: AbortSignal } | { timeout?: number };

export type FetchCommonJsonRequest = {
  url: string;
  params?: FetchParams;
  paramsOptions?: FetchParamsOptions;
  headers?: FetchHeaders;
  cacheBuster?: 'short' | 'long';
  init?: Omit<RequestInit, 'headers' | 'body' | 'signal' | 'method'>;
} & FetchAbortSignal;

export type FetchGetJsonRequest = FetchCommonJsonRequest;

export type FetchBody = PassThroughBodyInit | Record<string, unknown>;

export type FetchPostJsonRequest = FetchCommonJsonRequest & {
  body: FetchBody;
};

export type FetchRequestInit = Omit<RequestInit, 'headers'> & {
  headers: Headers; // make headers required
};
