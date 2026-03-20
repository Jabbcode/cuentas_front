import { Link } from 'react-router-dom';
import { CreditCard, AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils';
import type { CreditCardsSummary } from '../../types';

interface CreditCardsSummaryProps {
  summary: CreditCardsSummary;
}

export function CreditCardsSummaryCard({ summary }: CreditCardsSummaryProps) {
  if (summary.cards.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: 'info' | 'warning' | 'error') => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: 'info' | 'warning' | 'error') => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <CreditCard className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
          </div>
          <div>
            <CardTitle className="text-base lg:text-lg">Tarjetas de Crédito</CardTitle>
            <p className="text-xs text-gray-500 lg:text-sm">
              {summary.cards.length} tarjeta{summary.cards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link to="/credit-cards">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            Ver todas <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0 space-y-4">
        {/* Total to pay */}
        {summary.totalToPay > 0 && (
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <p className="text-sm font-medium text-gray-600">Total a pagar este mes</p>
            <p className="mt-1 text-2xl font-bold text-purple-600 lg:text-3xl">
              {formatCurrency(summary.totalToPay)}
            </p>
          </div>
        )}

        {/* Upcoming payments */}
        {summary.upcomingPayments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Próximos vencimientos</h4>
            <div className="space-y-2">
              {summary.upcomingPayments.slice(0, 3).map((payment) => (
                <div
                  key={payment.accountId}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    payment.daysUntilDue <= 3
                      ? 'border-red-200 bg-red-50'
                      : payment.daysUntilDue <= 7
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.accountName}</p>
                    <p className="text-sm text-gray-600">
                      {payment.daysUntilDue === 0
                        ? 'Vence hoy'
                        : payment.daysUntilDue === 1
                        ? 'Vence mañana'
                        : payment.daysUntilDue < 0
                        ? `Vencido hace ${Math.abs(payment.daysUntilDue)} día${Math.abs(payment.daysUntilDue) !== 1 ? 's' : ''}`
                        : `Vence en ${payment.daysUntilDue} días`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    {payment.daysUntilDue <= 3 && (
                      <Badge variant="destructive" className="mt-1">
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {summary.alerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Alertas</h4>
            <div className="space-y-2">
              {summary.alerts.slice(0, 3).map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 rounded-lg border p-2 ${getSeverityColor(alert.severity)}`}
                >
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{alert.accountName}</p>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {summary.totalToPay === 0 && summary.upcomingPayments.length === 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-800">
              ✓ No tienes pagos pendientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
