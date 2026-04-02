import { useState } from 'react';
import { Wallet, CreditCard, Banknote, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency, cn } from '../../lib/utils';
import type { Account } from '../../types';

const accountTypeIcons = {
  cash: Banknote,
  bank: Wallet,
  credit_card: CreditCard,
};

const accountTypeLabels = {
  cash: 'Efectivo',
  bank: 'Banco',
  credit_card: 'Tarjeta de Crédito',
};

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = accountTypeIcons[account.type];

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: account.color || '#3B82F6' }}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{account.name}</h3>
              <p className="text-sm text-gray-500">
                {accountTypeLabels[account.type]}
              </p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(account);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(account.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          {/* Credit card detailed view */}
          {account.type === 'credit_card' && account.creditLimit ? (
            <div className="space-y-3">
              {/* Available credit - highlighted */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponible</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    account.creditLimit - Math.abs(Number(account.balance)),
                    account.currency
                  )}
                </span>
              </div>

              {/* Usage bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Usado</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(Math.abs(Number(account.balance)), account.currency)} /{' '}
                    {formatCurrency(account.creditLimit, account.currency)}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gray-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        account.creditLimit > 0
                          ? (Math.abs(Number(account.balance)) / account.creditLimit) * 100
                          : 0
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {account.creditLimit > 0
                      ? Math.round((Math.abs(Number(account.balance)) / account.creditLimit) * 100)
                      : 0}
                    % usado
                  </span>
                  {account.cutoffDay && account.paymentDueDay && (
                    <span>
                      Corte/Pago: {account.cutoffDay}/{account.paymentDueDay}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Regular account view */
            <p
              className={cn(
                'text-2xl font-bold',
                Number(account.balance) >= 0 ? 'text-gray-900' : 'text-red-600'
              )}
            >
              {formatCurrency(Number(account.balance), account.currency)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
