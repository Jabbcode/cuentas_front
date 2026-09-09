import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsPage } from './useSettingsPage';

describe('useSettingsPage', () => {
  it('inicia con activeTab="profile"', () => {
    const { result } = renderHook(() => useSettingsPage());

    expect(result.current.activeTab).toBe('profile');
  });

  it('setActiveTab cambia la pestaña activa', () => {
    const { result } = renderHook(() => useSettingsPage());

    act(() => result.current.setActiveTab('password'));

    expect(result.current.activeTab).toBe('password');
  });
});
