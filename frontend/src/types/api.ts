export interface ApiResponse<T> {
  data: T;
  error: ExceptionResponse;
  meta: Metadata;
}

export interface ExceptionResponse {
  statusCode: number;
  name: string;
  message: string;
}

export interface Metadata {
  timestamp: string;
}
