import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useBankMapping } from '../hooks/useBankMapping';
import { useAccounts } from '../features/accounts/hooks/useAccounts';
import { Button } from '../components/ui/button';

export function BankingMapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pendingId = searchParams.get('pending');

  const { truelayerAccounts, mappings, setMapping, submit, loading, loadAccounts } =
    useBankMapping();
  const { accounts: appAccounts, loading: loadingAccounts } = useAccounts();

  useEffect(() => {
    if (!pendingId) {
      navigate('/accounts', { replace: true });
      return;
    }
    loadAccounts(pendingId);
  }, [pendingId, loadAccounts, navigate]);

  const handleSubmit = async () => {
    if (!pendingId) return;
    try {
      await submit(pendingId);
      toast.success('Cuentas vinculadas correctamente');
      navigate('/accounts');
    } catch {
      toast.error('Error al confirmar los mapeos bancarios');
    }
  };

  if (loading || loadingAccounts) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vincular sub-cuentas bancarias</h1>
        <p className="mt-1 text-sm text-gray-500">
          Asigna cada sub-cuenta del banco a una cuenta existente en la app. Puedes dejar algunas
          sin vincular.
        </p>
      </div>

      {truelayerAccounts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No se encontraron sub-cuentas disponibles.
        </div>
      ) : (
        <div className="space-y-4">
          {truelayerAccounts.map((tlAccount) => (
            <div
              key={tlAccount.truelayerAccountId}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-3">
                <p className="font-medium text-gray-900">{tlAccount.name}</p>
                <p className="text-sm text-gray-500">
                  {tlAccount.type} · {tlAccount.currency} ·{' '}
                  {tlAccount.balance.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: tlAccount.currency,
                  })}
                </p>
              </div>

              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={mappings[tlAccount.truelayerAccountId] ?? ''}
                onChange={(e) => setMapping(tlAccount.truelayerAccountId, e.target.value)}
              >
                <option value="">No vincular</option>
                {appAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/accounts')} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? 'Confirmando...' : 'Confirmar mapeos'}
        </Button>
      </div>
    </div>
  );
}
