import axios from 'axios';

export function getApiErrorMessage(
  err: unknown,
  fallback = 'Ha ocurrido un error inesperado'
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
