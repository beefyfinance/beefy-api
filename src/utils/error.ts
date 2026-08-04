export function isError(err: unknown): err is Error {
  return !!err && err instanceof Error;
}

export function errorToString(error: unknown): string {
  if (error === null || typeof error === 'undefined') {
    return 'unknown error';
  } else if (
    isError(error)
    || (typeof error === 'object' && 'message' in error && typeof error['message'] === 'string')
  ) {
    return `${error['message'] || 'unknown error'}`;
  }

  return String(error);
}
