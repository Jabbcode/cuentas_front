import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, CalendarClock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CategoryIcon } from '../components/ui/category-icon';
import { dashboardApi } from '../api/dashboard.api';
import { fixedExpensesApi } from '../api/fixed-expenses.api';
import { creditCardsApi } from '../api/credit-cards.api';
import { formatCurrency } from '../lib/utils';
import type { DashboardSummary, CategorySummary, FixedExpenseSummary, FixedVsVariable, ProjectionData, CreditCardsSummary } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { NextMonthProjection } from '../components/dashboard/NextMonthProjection';
import { CreditCardsSummaryCard } from '../components/dashboard/CreditCardsSummary';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [byCategory, setByCategory] = useState<CategorySummary[]>([]);
  const [fixedSummary, setFixedSummary] = useState<FixedExpenseSummary | null>(null);
  const [fixedVsVariable, setFixedVsVariable] = useState<FixedVsVariable | null>(null);
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [creditCardsSummary, setCreditCardsSummary] = useState<CreditCardsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getSummary(),
      dashboardApi.getByCategory('expense'),
      fixedExpensesApi.getSummary(),
      dashboardApi.getFixedVsVariable(),
      dashboardApi.getNextMonthProjection(),
      creditCardsApi.getSummary().catch(() => ({ totalToPay: 0, upcomingPayments: [], alerts: [], cards: [] })),
    ])
      .then(([sum, cat, fixed, fvv, proj, ccSummary]) => {
        setSummary(sum);
        setByCategory(cat);
        setFixedSummary(fixed);
        setFixedVsVariable(fvv);
        setProjection(proj);
        setCreditCardsSummary(ccSummary);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Dashboard</h1>
        <p className="text-sm text-gray-500 lg:text-base">Resumen de tus finanzas personales</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
              Balance Total
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-1.5 lg:p-2">
              <Wallet className="h-3 w-3 text-blue-600 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="text-lg font-bold text-gray-900 lg:text-2xl">
              {formatCurrency(summary?.totalBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
              Ingresos
            </CardTitle>
            <div className="rounded-full bg-green-100 p-1.5 lg:p-2">
              <TrendingUp className="h-3 w-3 text-green-600 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="text-lg font-bold text-green-600 lg:text-2xl">
              +{formatCurrency(summary?.monthlyIncome || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
              Gastos
            </CardTitle>
            <div className="rounded-full bg-red-100 p-1.5 lg:p-2">
              <TrendingDown className="h-3 w-3 text-red-600 lg:h-4 lg:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="text-lg font-bold text-red-600 lg:text-2xl">
              -{formatCurrency(summary?.monthlyExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 lg:text-sm">
              Balance Neto
            </CardTitle>
            <div className={`rounded-full p-1.5 lg:p-2 ${(summary?.monthlyNet || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {(summary?.monthlyNet || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 lg:h-4 lg:w-4" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 lg:h-4 lg:w-4" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div
              className={`text-lg font-bold lg:text-2xl ${
                (summary?.monthlyNet || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary?.monthlyNet || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Expenses Summary Card */}
      {fixedSummary && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <CalendarClock className="h-4 w-4 text-blue-600 lg:h-5 lg:w-5" />
              </div>
              <div>
                <CardTitle className="text-base lg:text-lg">Gastos Fijos</CardTitle>
                <p className="text-xs text-gray-500 lg:text-sm">Pagos recurrentes</p>
              </div>
            </div>
            <Link to="/fixed-expenses">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
              <div className="rounded-lg bg-gray-50 p-2 text-center lg:p-4">
                <p className="text-xs font-medium text-gray-500 lg:text-sm">Total</p>
                <p className="mt-1 text-base font-bold text-gray-900 lg:text-2xl">
                  {formatCurrency(fixedSummary.totalMonthlyExpenses)}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-2 text-center lg:p-4">
                <p className="text-xs font-medium text-gray-500 lg:text-sm">Pagados</p>
                <p className="mt-1 text-base font-bold text-green-600 lg:text-2xl">
                  {fixedSummary.paidCount}/{fixedSummary.totalCount}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-2 text-center lg:p-4">
                <p className="text-xs font-medium text-gray-500 lg:text-sm">Pendientes</p>
                <p className="mt-1 text-base font-bold text-orange-600 lg:text-2xl">
                  {fixedSummary.pendingCount}
                </p>
              </div>
            </div>

            {fixedSummary.pendingCount > 0 && (
              <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-2 lg:mt-4 lg:p-3">
                <p className="text-xs font-medium text-orange-800 lg:text-sm">
                  {fixedSummary.pendingCount} gasto(s) pendiente(s) este mes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credit Cards Summary */}
      {creditCardsSummary && <CreditCardsSummaryCard summary={creditCardsSummary} />}

      {/* Next Month Projection */}
      {projection && <NextMonthProjection projection={projection} />}

      {/* Charts Row */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Expenses by Category */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
            {byCategory.length > 0 ? (
              <div className="flex flex-col items-center gap-4 lg:gap-6 lg:flex-row">
                <ResponsiveContainer width={140} height={140} className="lg:!w-[180px] lg:!h-[180px]">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      label={false}
                    >
                      {byCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full flex-1 space-y-1.5 lg:space-y-2">
                  {byCategory.slice(0, 5).map((cat, index) => (
                    <div key={cat.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full lg:h-3 lg:w-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <CategoryIcon icon={cat.icon} color={cat.color} size="sm" tooltip={cat.name} />
                        <span className="text-xs text-gray-700 lg:text-sm">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-gray-900 lg:text-sm">{formatCurrency(cat.total)}</span>
                        <span className="ml-1 text-[10px] text-gray-500 lg:ml-2 lg:text-xs">({cat.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-gray-500 lg:h-48">
                Sin gastos este mes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fixed vs Variable */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Fijos vs Variables</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
            {fixedVsVariable && fixedVsVariable.total > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={140} className="lg:!h-[180px]">
                  <BarChart
                    data={[
                      { name: 'Fijos', value: fixedVsVariable.fixed, fill: '#3B82F6' },
                      { name: 'Variables', value: fixedVsVariable.variable, fill: '#10B981' },
                    ]}
                    layout="vertical"
                    margin={{ left: 0 }}
                  >
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex justify-center gap-6 lg:mt-4 lg:gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 lg:h-3 lg:w-3" />
                      <span className="text-xs text-gray-600 lg:text-sm">Fijos</span>
                    </div>
                    <p className="mt-1 text-base font-bold text-blue-600 lg:text-lg">
                      {fixedVsVariable.fixedPercentage}%
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 lg:h-3 lg:w-3" />
                      <span className="text-xs text-gray-600 lg:text-sm">Variables</span>
                    </div>
                    <p className="mt-1 text-base font-bold text-green-600 lg:text-lg">
                      {fixedVsVariable.variablePercentage}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-gray-500 lg:h-48">
                Sin datos de gastos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
