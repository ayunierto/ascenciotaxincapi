export interface ExceptionResponse {
  message: string;
  error: string;
  statusCode?: number;
  cause?: string;
}
