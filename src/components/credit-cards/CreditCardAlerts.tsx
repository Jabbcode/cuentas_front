import { AlertCircle } from 'lucide-react';

interface Alert {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

interface CreditCardAlertsProps {
  alerts: Alert[];
}

export function CreditCardAlerts({ alerts }: CreditCardAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`flex items-start gap-2 rounded-lg border p-2 text-sm ${
            alert.severity === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : alert.severity === 'warning'
              ? 'border-orange-200 bg-orange-50 text-orange-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
