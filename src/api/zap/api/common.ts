export type SuccessApiResponse<T, E extends Record<string, unknown> | undefined = undefined> = {
  code: 200;
  data: T;
} & (E extends undefined ? {} : { extra: E });

export type ErrorApiResponse = {
  code: number;
  message: string;
};

export type ApiResponse<T, E extends Record<string, unknown> | undefined = undefined> =
  | SuccessApiResponse<T, E>
  | ErrorApiResponse;

export function isSuccessApiResponse<T, E extends Record<string, unknown> | undefined = undefined>(
  obj: ApiResponse<T, E>
): obj is SuccessApiResponse<T, E> {
  return obj.code === 200;
}

export function isErrorApiResponse<T, E extends Record<string, unknown> | undefined = undefined>(
  obj: ApiResponse<T, E>
): obj is ErrorApiResponse {
  return obj.code !== 200;
}

export type ExtraQuoteResponse = {
  fee: { value: number } | { value: number; original: number };
};
