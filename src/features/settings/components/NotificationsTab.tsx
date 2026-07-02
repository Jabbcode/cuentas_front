import { Card } from '../../../components/ui/card';
import { useNotificationPreferences } from '../../../hooks/useNotifications';

interface NotificationItem {
  key: 'categoryLimit' | 'debtDue' | 'monthlyEmail';
  label: string;
  desc: string;
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    key: 'categoryLimit',
    label: 'Límite de categoría superado',
    desc: 'Alerta cuando un gasto mensual supera el límite configurado.',
  },
  {
    key: 'debtDue',
    label: 'Deudas próximas a vencer',
    desc: 'Notificación cuando una deuda vence en los próximos 3 días.',
  },
  {
    key: 'monthlyEmail',
    label: 'Resumen mensual por email',
    desc: 'Recibe un correo con tus gastos al inicio de cada mes.',
  },
];

export function NotificationsTab() {
  const { preferences, update } = useNotificationPreferences();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-1">Preferencias de Notificaciones</h2>
      <p className="text-sm text-gray-600 mb-6">Elige qué notificaciones quieres recibir.</p>
      {preferences ? (
        <div className="space-y-4">
          {NOTIFICATION_ITEMS.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={preferences[key]}
                onClick={() => update({ [key]: !preferences[key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    preferences[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
      )}
    </Card>
  );
}
