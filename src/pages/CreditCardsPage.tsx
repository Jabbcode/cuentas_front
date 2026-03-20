import { useEffect, useState } from 'react';
import { CreditCard, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { creditCardsApi } from '../api/credit-cards.api';
import { accountsApi } from '../api/accounts.api';
import { formatCurrency, formatDate } from '../lib/utils';
import type { CreditCardStatement, Account } from '../types';

export function CreditCardsPage() {
  const [statements, setStatements] = useState<CreditCardStatement[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    statement: CreditCardStatement | null;
  }>({ open: false, statement: null });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentAccountId: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [paying, setPaying] = useState(false);

  const loadData = async () => {
    try {
      const [summary, allAccounts] = await Promise.all([
        creditCardsApi.getSummary(),
        accountsApi.getAll(),
      ]);
      setStatements(summary.cards);
      setAccounts(allAccounts.filter((acc) => acc.type !== 'credit_card'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPayment = (statement: CreditCardStatement) => {
    setPaymentModal({ open: true, statement });
    setPaymentData({
      amount: statement.closedPeriod.balance.toString(),
      paymentAccountId: accounts.length > 0 ? accounts[0].id : '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleClosePayment = () => {
    setPaymentModal({ open: false, statement: null });
    setPaymentData({
      amount: '',
      paymentAccountId: accounts.length > 0 ? accounts[0].id : '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.statement) return;

    setPaying(true);
    try {
      await creditCardsApi.payStatement(paymentModal.statement.account.id, {
        amount: parseFloat(paymentData.amount),
        paymentAccountId: paymentData.paymentAccountId,
        paymentDate: paymentData.paymentDate,
      });
      handleClosePayment();
      loadData();
    } catch (error) {
      console.error('Error paying statement:', error);
    } finally {
      setPaying(false);
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDaysColor = (days: number) => {
    if (days <= 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
          <p className="text-gray-500">Gestiona tus tarjetas de crédito</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">
              No tienes tarjetas de crédito configuradas.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Crea una cuenta de tipo "Tarjeta de Crédito" en Cuentas para empezar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
        <p className="text-gray-500">Gestiona tus tarjetas y pagos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 lg:p-6 lg:pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total a Pagar
            </CardTitle>
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                statements.reduce(
                  (sum, s) => sum + (s.closedPeriod.isPaid ? 0 : s.closedPeriod.balance),
                  0
                )
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statements.filter((s) => !s.closedPeriod.isPaid).length} tarjeta(s) pendiente(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 lg:p-6 lg:pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Período Actual
            </CardTitle>
            <div className="rounded-full bg-orange-100 p-2">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                statements.reduce((sum, s) => sum + s.currentPeriod.balance, 0)
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Acumulado este período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 lg:p-6 lg:pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Disponible Total
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(statements.reduce((sum, s) => sum + s.available, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              de {formatCurrency(statements.reduce((sum, s) => sum + s.creditLimit, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Cards List */}
      <div className="space-y-4">
        {statements.map((statement) => (
          <Card key={statement.account.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{statement.account.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Límite: {formatCurrency(statement.creditLimit)}
                    </p>
                  </div>
                </div>
                {statement.closedPeriod.isPaid ? (
                  <Badge variant="success">Pagado</Badge>
                ) : (
                  <Button
                    onClick={() => handleOpenPayment(statement)}
                    disabled={statement.closedPeriod.balance === 0}
                  >
                    Pagar
                  </Button>
                )}
              </div>

              {/* Usage Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Uso del límite</span>
                  <span className="font-medium">{statement.usagePercentage}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${getUsageColor(
                      statement.usagePercentage
                    )}`}
                    style={{ width: `${Math.min(statement.usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-1 text-gray-500">
                  <span>Disponible: {formatCurrency(statement.available)}</span>
                  <span>
                    Usado: {formatCurrency(statement.currentPeriod.balance + (statement.closedPeriod.isPaid ? 0 : statement.closedPeriod.balance))}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 lg:p-6 space-y-4">
              {/* Alerts */}
              {statement.alerts.length > 0 && (
                <div className="space-y-2">
                  {statement.alerts.map((alert, index) => (
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
              )}

              {/* Periods */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Closed Period */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">A Pagar</h4>
                    {statement.closedPeriod.isPaid && (
                      <Badge variant="success">Pagado</Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Período:</span>
                      <span className="font-medium">
                        {formatDate(statement.closedPeriod.startDate)} -{' '}
                        {formatDate(statement.closedPeriod.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto:</span>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(statement.closedPeriod.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className={`font-medium ${getDaysColor(statement.closedPeriod.daysUntilDue)}`}>
                        {formatDate(statement.closedPeriod.paymentDueDate)}
                        <span className="text-xs ml-1">
                          ({statement.closedPeriod.daysUntilDue === 0
                            ? 'hoy'
                            : statement.closedPeriod.daysUntilDue === 1
                            ? 'mañana'
                            : statement.closedPeriod.daysUntilDue < 0
                            ? `vencido`
                            : `${statement.closedPeriod.daysUntilDue}d`})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transacciones:</span>
                      <span>{statement.closedPeriod.transactions.length}</span>
                    </div>
                  </div>
                </div>

                {/* Current Period */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Período Actual</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Período:</span>
                      <span className="font-medium">
                        {formatDate(statement.currentPeriod.startDate)} -{' '}
                        {formatDate(statement.currentPeriod.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acumulado:</span>
                      <span className="text-lg font-bold text-orange-600">
                        {formatCurrency(statement.currentPeriod.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cierra en:</span>
                      <span className="font-medium">
                        {statement.currentPeriod.daysUntilCutoff} día
                        {statement.currentPeriod.daysUntilCutoff !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transacciones:</span>
                      <span>{statement.currentPeriod.transactions.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModal.open} onClose={handleClosePayment}>
        <DialogHeader>
          <DialogTitle>Pagar Estado de Cuenta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handlePay}>
          <DialogContent className="space-y-4">
            {paymentModal.statement && (
              <>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Tarjeta</p>
                  <p className="text-lg font-medium">{paymentModal.statement.account.name}</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(paymentModal.statement.closedPeriod.balance)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="amount">Monto a pagar</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={paymentModal.statement.closedPeriod.balance}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Monto máximo: {formatCurrency(paymentModal.statement.closedPeriod.balance)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="paymentAccount">Pagar desde</Label>
                  <Select
                    id="paymentAccount"
                    value={paymentData.paymentAccountId}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, paymentAccountId: e.target.value })
                    }
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentDate">Fecha de pago</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, paymentDate: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClosePayment}>
              Cancelar
            </Button>
            <Button type="submit" disabled={paying}>
              {paying ? 'Procesando...' : 'Pagar'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
