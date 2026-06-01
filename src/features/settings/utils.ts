import type { FeedbackMessage } from './types';
import { getApiErrorMessage } from '../../lib/api-errors';

export function extractApiError(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback);
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
