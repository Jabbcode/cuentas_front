import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { CategoryIcon } from '../../../components/ui/category-icon';
import { BudgetProgressBar } from './BudgetProgressBar';
import { formatCurrency, cn } from '../../../lib/utils';
import type { Budget } from '../../../types';

export interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  return (
    <Card
      className={cn(
        budget.isOverBudget && 'border-red-200',
        budget.isNearLimit && !budget.isOverBudget && 'border-yellow-200'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon icon={budget.category.icon} color={budget.category.color} size="md" />
            <CardTitle className="text-base">{budget.category.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-600"
              onClick={() => onDelete(budget.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BudgetProgressBar
          spent={budget.spent}
          amount={budget.amount}
          percentage={budget.percentage}
          isOverBudget={budget.isOverBudget}
          isNearLimit={budget.isNearLimit}
        />
        {!budget.isOverBudget && (
          <p className="mt-2 text-xs text-gray-500">
            Disponible: {formatCurrency(budget.remaining)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
