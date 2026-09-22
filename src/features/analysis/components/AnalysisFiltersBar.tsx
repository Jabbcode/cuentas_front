import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import type { Account } from '../../../types';

interface AnalysisFiltersBarProps {
  startDate: string;
  endDate: string;
  rangeError: string | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  accountId: string;
  accounts: Account[];
  onAccountChange: (accountId: string) => void;
  type: 'expense' | 'income';
  onTypeChange: (type: 'expense' | 'income') => void;
}

export function AnalysisFiltersBar({
  startDate,
  endDate,
  rangeError,
  onStartDateChange,
  onEndDateChange,
  accountId,
  accounts,
  onAccountChange,
  type,
  onTypeChange,
}: AnalysisFiltersBarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="analysis-start-date" className="text-xs">
              Desde
            </Label>
            <Input
              id="analysis-start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="analysis-end-date" className="text-xs">
              Hasta
            </Label>
            <Input
              id="analysis-end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="analysis-account" className="text-xs">
              Cuenta
            </Label>
            <Select
              id="analysis-account"
              value={accountId}
              onChange={(e) => onAccountChange(e.target.value)}
              className="mt-1"
            >
              <option value="all">Todas las cuentas</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <div className="mt-1 flex gap-2" role="group" aria-label="Tipo de movimiento">
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                size="sm"
                aria-pressed={type === 'expense'}
                onClick={() => onTypeChange('expense')}
                className="flex-1"
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                size="sm"
                aria-pressed={type === 'income'}
                onClick={() => onTypeChange('income')}
                className="flex-1"
              >
                Ingreso
              </Button>
            </div>
          </div>
        </div>

        {rangeError && <p className="mt-3 text-xs text-red-600">{rangeError}</p>}
      </CardContent>
    </Card>
  );
}
