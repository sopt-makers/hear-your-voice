export interface SubmitResult {
  success: boolean;
  code: 'SUCCESS' | 'INVALID_SPRINT' | 'USER_NOT_FOUND' | 'UNKNOWN_ERROR';
  message: string;
}
