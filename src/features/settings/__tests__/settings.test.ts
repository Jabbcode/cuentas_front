import { describe, it, expect } from 'vitest';
import { extractApiError, createFeedbackMessage, formatMemberSince } from '../utils';

describe('extractApiError', () => {
  it('returns the nested error message from an Axios response', () => {
    const err = { response: { data: { error: 'Email already in use' } } };
    expect(extractApiError(err, 'fallback')).toBe('Email already in use');
  });

  it('returns the fallback when err has no response', () => {
    expect(extractApiError(new Error('network'), 'fallback')).toBe('fallback');
  });

  it('returns the fallback when response.data.error is undefined', () => {
    const err = { response: { data: {} } };
    expect(extractApiError(err, 'default error')).toBe('default error');
  });

  it('returns the fallback when err is null', () => {
    expect(extractApiError(null, 'null fallback')).toBe('null fallback');
  });

  it('returns the fallback when err is undefined', () => {
    expect(extractApiError(undefined, 'undefined fallback')).toBe('undefined fallback');
  });
});

describe('createFeedbackMessage', () => {
  it('creates a success message', () => {
    const msg = createFeedbackMessage('success', 'Saved!');
    expect(msg).toEqual({ type: 'success', text: 'Saved!' });
  });

  it('creates an error message', () => {
    const msg = createFeedbackMessage('error', 'Something went wrong');
    expect(msg).toEqual({ type: 'error', text: 'Something went wrong' });
  });
});

describe('formatMemberSince', () => {
  it('formats an ISO date string into a locale date string', () => {
    const result = formatMemberSince('2024-01-15T00:00:00.000Z');
    // Verify it returns a non-empty string (locale-dependent output)
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('parses a valid ISO date without throwing', () => {
    expect(() => formatMemberSince('2023-06-01T12:00:00Z')).not.toThrow();
  });
});
