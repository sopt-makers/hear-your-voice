import { NetworkError, ServiceError } from './errors';

interface SupabaseError {
  message?: string;
  code?: string;
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return typeof error === 'object' && error !== null && 'message' in error && 'code' in error;
}

/**
 * Supabase API 호출을 감싸서 에러를 분류합니다.
 * - 네트워크 오류 (Failed to fetch) → NetworkError → toast
 * - 그 외 Supabase 에러 → ServiceError → /error 페이지
 */
export async function callApi<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError();
    }

    if (isSupabaseError(error)) {
      if (error.message?.includes('Failed to fetch')) {
        throw new NetworkError();
      }
      throw new ServiceError();
    }

    throw error;
  }
}
