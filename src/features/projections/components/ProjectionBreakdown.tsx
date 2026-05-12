import type { ProjectedFixedExpense, ProjectedDebtPayment } from '../types';
import { formatAmount, formatFullDate, frequencyLabel } from '../utils';

interface ProjectionBreakdownProps {
  fixedExpenses: ProjectedFixedExpense[];
  fixedIncome: ProjectedFixedExpense[];
  debtPayments: ProjectedDebtPayment[];
  historicalForPeriod: number;
  monthlyAverage: number;
}

export function ProjectionBreakdown({
  fixedExpenses,
  fixedIncome,
  debtPayments,
  historicalForPeriod,
  monthlyAverage,
}: ProjectionBreakdownProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <BreakdownSection
        title="Gastos Fijos"
        items={fixedExpenses.map((fe) => ({
          key: `${fe.id}-${fe.dueDate}`,
          label: fe.name,
          sublabel: fe.categoryName ?? undefined,
          date: fe.dueDate,
          amount: fe.amount,
          sign: 'negative' as const,
        }))}
      />
      <BreakdownSection
        title="Ingresos Fijos"
        items={fixedIncome.map((fe) => ({
          key: `${fe.id}-${fe.dueDate}`,
          label: fe.name,
          sublabel: fe.categoryName ?? undefined,
          date: fe.dueDate,
          amount: fe.amount,
          sign: 'positive' as const,
        }))}
      />
      <BreakdownSection
        title="Pagos de Deudas"
        items={debtPayments.map((dp) => ({
          key: `${dp.id}-${dp.dueDate}`,
          label: dp.debtName,
          sublabel: frequencyLabel(dp.frequency),
          date: dp.dueDate,
          amount: dp.amount,
          sign: 'negative' as const,
        }))}
      />
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-gray-900">Gasto Variable Estimado</h3>
        <p className="text-sm text-gray-500">Promedio mensual de los últimos 3 meses</p>
        <p className="mt-1 text-xs text-gray-400">
          Promedio mensual: ${formatAmount(monthlyAverage)}
        </p>
        <p className="mt-3 text-2xl font-bold text-orange-600">
          ${formatAmount(historicalForPeriod)}
        </p>
      </div>
    </div>
  );
}

interface BreakdownItem {
  key: string;
  label: string;
  sublabel?: string;
  date: string;
  amount: number;
  sign: 'positive' | 'negative';
}

interface BreakdownSectionProps {
  title: string;
  items: BreakdownItem[];
}

function BreakdownSection({ title, items }: BreakdownSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-gray-900">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Sin movimientos en este período</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <span className="font-medium text-gray-800">{item.label}</span>
                {item.sublabel && (
                  <span className="ml-1.5 text-xs text-gray-400">· {item.sublabel}</span>
                )}
                <p className="text-xs text-gray-400">{formatFullDate(item.date)}</p>
              </div>
              <span
                className={`shrink-0 font-semibold ${
                  item.sign === 'negative' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {item.sign === 'negative' ? '-' : '+'}${formatAmount(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
