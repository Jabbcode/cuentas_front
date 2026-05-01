import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { BudgetProgressBar } from './BudgetProgressBar';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { budgetsApi } from '../api';
import { cn } from '../../../lib/utils';
import type { Budget } from '../../../types';

export function BudgetDashboardWidget() {
  const now = new Date();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    budgetsApi
      .getAll(now.getMonth() + 1, now.getFullYear())
      .then(setBudgets)
      .finally(() => setLoading(false));
  }, []);

  if (loading || budgets.length === 0) return null;

  const overBudgetCount = budgets.filter((b) => b.isOverBudget).length;
  const nearLimitCount = budgets.filter((b) => b.isNearLimit).length;

  return (
    <Card
      className={cn(
        overBudgetCount > 0 && 'border-red-200',
        nearLimitCount > 0 && !overBudgetCount && 'border-yellow-200'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn('rounded-full p-2', overBudgetCount > 0 ? 'bg-red-100' : 'bg-blue-100')}
            >
              <Target
                className={cn('h-5 w-5', overBudgetCount > 0 ? 'text-red-600' : 'text-blue-600')}
              />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Presupuestos</CardTitle>
              <p className="mt-0.5 text-sm text-gray-600">
                {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} este mes
              </p>
            </div>
          </div>
          <Link to="/budgets">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {budgets.slice(0, 4).map((budget) => (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <CategoryIcon icon={budget.category.icon} color={budget.category.color} size="sm" />
              <span className="text-sm font-medium text-gray-900">{budget.category.name}</span>
              {budget.isOverBudget && (
                <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  Excedido
                </span>
              )}
              {budget.isNearLimit && !budget.isOverBudget && (
                <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                  Cerca del límite
                </span>
              )}
            </div>
            <BudgetProgressBar
              spent={budget.spent}
              amount={budget.amount}
              percentage={budget.percentage}
              isOverBudget={budget.isOverBudget}
              isNearLimit={budget.isNearLimit}
            />
          </div>
        ))}
        {budgets.length > 4 && (
          <Link to="/budgets">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Ver {budgets.length - 4} más
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
