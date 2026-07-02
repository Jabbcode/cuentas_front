import type { FeedbackMessage } from './types';

export function extractApiError(err: unknown, fallback: string): string {
  if (err != null && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
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
