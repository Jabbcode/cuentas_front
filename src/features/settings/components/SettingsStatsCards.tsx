import { TrendingUp, User, Calendar } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import type { AccountStatistics, UserProfile } from '../api';
import { formatMemberSince } from '../utils';

export interface SettingsStatsCardsProps {
  statistics: AccountStatistics;
  profile: UserProfile;
}

export function SettingsStatsCards({ statistics, profile }: SettingsStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Transacciones</p>
            <p className="text-2xl font-bold">{statistics.transactions}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cuentas</p>
            <p className="text-2xl font-bold">{statistics.accounts}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Miembro desde</p>
            <p className="text-lg font-bold">{formatMemberSince(profile.createdAt)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
