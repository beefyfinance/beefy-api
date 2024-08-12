export class FetchError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message, { cause });
    this.name = 'FetchError';
  }
}

export class FetchResponseError extends FetchError {
  public constructor(public readonly response: Response, message?: string, cause?: Error) {
    super(message ?? `${response.status} ${response.statusText}`, cause);
    this.name = 'FetchResponseError';
  }
}

export class FetchResponseDecodeError extends FetchResponseError {
  public constructor(response: Response, cause?: Error) {
    super(response, `Failed to decode response body`, cause);
    this.name = 'FetchResponseDecodeError';
  }
}

export class FetchResponseBodyTextError extends FetchResponseError {
  public constructor(response: Response, cause?: Error) {
    super(response, `Failed to decode response body as text`, cause);
    this.name = 'FetchResponseBodyTextError';
  }
}

export class FetchResponseNotJsonError extends FetchResponseError {
  public constructor(response: Response, cause?: Error) {
    super(
      response,
      `Expected 'Content-Type: application/json', got '${response.headers.get('Content-Type')}'`,
      cause
    );
    this.name = 'FetchResponseNotJsonError';
  }
}

export class FetchResponseJsonParseError extends FetchResponseError {
  public constructor(response: Response, cause?: Error) {
    super(response, `Failed to parse response as JSON`, cause);
    this.name = 'FetchResponseJsonParseError';
  }
}

export class FetchTimeoutError extends FetchError {
  public constructor(cause: Error) {
    super('Request timed out', cause);
    this.name = 'FetchTimeoutError';
  }
}

export class FetchAbortError extends FetchError {
  public constructor(cause: Error) {
    super('Request was aborted', cause);
    this.name = 'FetchAbortError';
  }
}

export function isFetchError(value: unknown): value is FetchError {
  return !!value && value instanceof FetchError;
}

export function isFetchResponseError(value: unknown): value is FetchResponseError {
  return isFetchError(value) && value instanceof FetchResponseError;
}

export function isFetchNotFoundError(value: unknown): value is FetchResponseError {
  return isFetchResponseError(value) && value.response.status === 404;
}

export function isFetchResponseNotJsonError(value: unknown): value is FetchResponseNotJsonError {
  return isFetchError(value) && value instanceof FetchResponseNotJsonError;
}

export function isFetchResponseJsonParseError(
  value: unknown
): value is FetchResponseJsonParseError {
  return isFetchError(value) && value instanceof FetchResponseJsonParseError;
}

export function isFetchTimeoutError(value: unknown): value is FetchTimeoutError {
  return isFetchError(value) && value instanceof FetchTimeoutError;
}

export function isFetchAbortError(value: unknown): value is FetchAbortError {
  return isFetchError(value) && value instanceof FetchAbortError;
}
