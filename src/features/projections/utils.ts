export const PRESET_DAYS = [30, 60, 90] as const;
export type PresetDays = (typeof PRESET_DAYS)[number];

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatFullDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function frequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    monthly: 'Mensual',
    biweekly: 'Quincenal',
    weekly: 'Semanal',
  };
  return labels[frequency] ?? frequency;
}
