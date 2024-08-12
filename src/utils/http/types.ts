import { Blob } from 'buffer';
import { FormData } from 'undici-types/formdata';
import { URLSearchParams } from 'url';

export type PassThroughHeadersInit =
  | string[][]
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
  | ReadonlyArray<[string, string]>;

export type FetchParams = PassThroughURLSearchParamsInit | GetUrlSearchParamsRecord;

export type FetchParamsOptions = {
  // keep params with null values as "null" or custom string
  keepNull?: boolean | string;
  // keep params with undefined values as "undefined" or custom string
  keepUndefined?: boolean | string;
};

export type FetchHeaders = PassThroughHeadersInit;

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
