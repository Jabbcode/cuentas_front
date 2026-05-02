import type { FeedbackMessage } from './types';

/**
 * Extracts a human-readable error message from an Axios error response.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const axiosErr = err as { response?: { data?: { error?: string } } };
  return axiosErr?.response?.data?.error ?? fallback;
}

/**
 * Creates a feedback message object.
 */
export function createFeedbackMessage(
  type: FeedbackMessage['type'],
  text: string
): FeedbackMessage {
  return { type, text };
}

/**
 * Formats a ISO date string into a locale-aware date display.
 */
export function formatMemberSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
}
