import { useState, useCallback } from 'react';
import { useProjections } from './useProjections';
import type { UseProjectionsPageReturn } from '../types';

const DEFAULT_DAYS = 30;

export function useProjectionsPage(): UseProjectionsPageReturn {
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [customDays, setCustomDays] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const { data, isLoading, error } = useProjections(days);

  const setPresetDays = useCallback((preset: number) => {
    setDays(preset);
    setIsCustom(false);
    setCustomDays('');
  }, []);

  const handleCustomDays = useCallback((value: string) => {
    setCustomDays(value);
  }, []);

  const applyCustomDays = useCallback(() => {
    const parsed = parseInt(customDays, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 365) {
      setDays(parsed);
      setIsCustom(true);
    }
  }, [customDays]);

  return {
    data,
    isLoading,
    error,
    days,
    customDays,
    isCustom,
    setPresetDays,
    handleCustomDays,
    applyCustomDays,
  };
}
