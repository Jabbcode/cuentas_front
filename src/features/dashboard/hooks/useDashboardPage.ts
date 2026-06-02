import { useState, useCallback } from 'react';
import type { UseDashboardPageReturn } from '../types';

export function useDashboardPage(): UseDashboardPageReturn {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCreditCardsOpen, setIsCreditCardsOpen] = useState(false);
  const [isDebtsOpen, setIsDebtsOpen] = useState(false);
  const [isFixedOpen, setIsFixedOpen] = useState(false);
  const [isProjectionOpen, setIsProjectionOpen] = useState(false);

  const toggleAlerts = useCallback(() => {
    setIsAlertsOpen((prev) => !prev);
  }, []);

  const toggleCreditCards = useCallback(() => {
    setIsCreditCardsOpen((prev) => !prev);
  }, []);

  const toggleDebts = useCallback(() => {
    setIsDebtsOpen((prev) => !prev);
  }, []);

  const toggleFixed = useCallback(() => {
    setIsFixedOpen((prev) => !prev);
  }, []);

  const toggleProjection = useCallback(() => {
    setIsProjectionOpen((prev) => !prev);
  }, []);

  return {
    isAlertsOpen,
    isCreditCardsOpen,
    isDebtsOpen,
    isFixedOpen,
    isProjectionOpen,
    toggleAlerts,
    toggleCreditCards,
    toggleDebts,
    toggleFixed,
    toggleProjection,
  };
}
