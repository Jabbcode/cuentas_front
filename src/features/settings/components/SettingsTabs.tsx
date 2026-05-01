import { User, Lock, Trash2, Bell } from 'lucide-react';
import type { SettingsTab } from '../types';

export interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  danger?: boolean;
}

const TABS: TabConfig[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'password', label: 'Contraseña', icon: Lock },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'account', label: 'Cuenta', icon: Trash2, danger: true },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex gap-2 border-b">
      {TABS.map(({ id, label, icon: Icon, danger }) => {
        const isActive = activeTab === id;
        const activeColor = danger
          ? 'border-red-600 text-red-600'
          : 'border-blue-600 text-blue-600';
        return (
          <button
            key={id}
            className={`px-4 py-2 font-medium transition-colors ${
              isActive ? `border-b-2 ${activeColor}` : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTabChange(id)}
          >
            <Icon className="inline h-4 w-4 mr-2" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
