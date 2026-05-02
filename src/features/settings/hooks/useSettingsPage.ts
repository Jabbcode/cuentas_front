import { useState, useCallback } from 'react';
import type { SettingsTab, UseSettingsPageReturn } from '../types';

export function useSettingsPage(): UseSettingsPageReturn {
  const [activeTab, setActiveTabState] = useState<SettingsTab>('profile');

  const setActiveTab = useCallback((tab: SettingsTab) => {
    setActiveTabState(tab);
  }, []);

  return {
    activeTab,
    setActiveTab,
  };
}
