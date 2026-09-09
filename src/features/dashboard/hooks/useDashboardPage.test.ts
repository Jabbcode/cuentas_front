import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardPage } from './useDashboardPage';

describe('useDashboardPage', () => {
  it('todas las secciones arrancan cerradas', () => {
    const { result } = renderHook(() => useDashboardPage());

    expect(result.current.isAlertsOpen).toBe(false);
    expect(result.current.isCreditCardsOpen).toBe(false);
    expect(result.current.isDebtsOpen).toBe(false);
    expect(result.current.isFixedOpen).toBe(false);
    expect(result.current.isProjectionOpen).toBe(false);
  });

  it('cada toggle invierte solo su propia sección', () => {
    const { result } = renderHook(() => useDashboardPage());

    act(() => result.current.toggleCreditCards());
    expect(result.current.isCreditCardsOpen).toBe(true);
    expect(result.current.isAlertsOpen).toBe(false);
    expect(result.current.isDebtsOpen).toBe(false);

    act(() => result.current.toggleCreditCards());
    expect(result.current.isCreditCardsOpen).toBe(false);
  });

  it('toggleAlerts / toggleDebts / toggleFixed / toggleProjection alternan su propio estado', () => {
    const { result } = renderHook(() => useDashboardPage());

    act(() => result.current.toggleAlerts());
    expect(result.current.isAlertsOpen).toBe(true);

    act(() => result.current.toggleDebts());
    expect(result.current.isDebtsOpen).toBe(true);

    act(() => result.current.toggleFixed());
    expect(result.current.isFixedOpen).toBe(true);

    act(() => result.current.toggleProjection());
    expect(result.current.isProjectionOpen).toBe(true);
  });
});
