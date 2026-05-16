import { useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw, Unlink, Link } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { bankingApi } from '../../../api/banking.api';
import type { BankConnection } from '../../../types/banking.types';

interface BankConnectionBadgeProps {
  connection: BankConnection | null;
  onDisconnect: () => void;
  onSync: () => void;
}

export function BankConnectionBadge({
  connection,
  onDisconnect,
  onSync,
}: BankConnectionBadgeProps) {
  const handleVincular = useCallback(async () => {
    const { authUrl } = await bankingApi.initConnect();
    window.location.href = authUrl;
  }, []);

  if (!connection) {
    return (
      <div className="mt-3 border-t border-gray-100 pt-3">
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleVincular}>
          <Link className="mr-1.5 h-3 w-3" />
          Vincular banco
        </Button>
      </div>
    );
  }

  const syncAgo = connection.lastSyncedAt
    ? formatDistanceToNow(new Date(connection.lastSyncedAt), { addSuffix: true, locale: es })
    : 'nunca';

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-green-700">{connection.bankName}</p>
          <p className="text-xs text-gray-500">sync {syncAgo}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Sincronizar"
            onClick={onSync}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:text-red-700"
            title="Desconectar"
            onClick={onDisconnect}
          >
            <Unlink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
