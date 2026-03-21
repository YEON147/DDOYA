import axios from 'axios';

/** Axios 응답 body 또는 Error 메시지에서 사용자용 문구 추출 */
export function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; data?: { message?: string } }
      | undefined;
    const fromBody = data?.message ?? data?.data?.message ?? data?.error;
    if (fromBody) return String(fromBody);
    if (error.message) return error.message;
    return fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
