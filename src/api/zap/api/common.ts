export type SuccessApiResponse<T> = {
  code: 200;
  data: T;
};

export type ErrorApiResponse = {
  code: number;
  message: string;
};

export type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse;

export function isSuccessApiResponse<T>(obj: ApiResponse<T>): obj is SuccessApiResponse<T> {
  return obj.code === 200;
}

export function isErrorApiResponse<T>(obj: ApiResponse<T>): obj is ErrorApiResponse {
  return obj.code !== 200;
}
