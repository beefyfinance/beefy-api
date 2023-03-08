export function errorToString(error: unknown): string {
  if (error === null || typeof error === 'undefined') {
    return 'Error: unknown error';
  } else if (
    error instanceof Error ||
    (typeof error === 'object' && 'message' in error && typeof error['message'] === 'string')
  ) {
    return `Error: ${error['message'] || 'unknown error'}`;
  }

  return `Error: ${error}`;
}
