import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settings.api';
import type { UserProfile, AccountStatistics } from '../api/settings.api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Lock, Trash2, TrendingUp, Calendar } from 'lucide-react';

export function SettingsPage() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        settingsApi.getProfile(),
        settingsApi.getStatistics(),
      ]);
      setProfile(profileData);
      setStatistics(statsData);
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Error loading data');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await settingsApi.updateProfile({
        ...(name !== profile?.name && { name }),
        ...(email !== profile?.email && { email }),
      });
      setProfile(updatedProfile);
      showMessage('success', 'Profile updated successfully');
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await settingsApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password changed successfully');
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmation !== 'DELETE') {
      showMessage('error', 'Please type DELETE to confirm');
      return;
    }

    if (!window.confirm('Are you sure? This action cannot be undone!')) {
      return;
    }

    setLoading(true);

    try {
      await settingsApi.deleteAccount({
        password: deletePassword,
        confirmation: 'DELETE',
      });
      showMessage('success', 'Account deleted successfully. Redirecting...');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Error deleting account');
      setLoading(false);
    }
  };

  if (!profile || !statistics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Gestiona tu cuenta y preferencias</p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
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
              <p className="text-lg font-bold">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          <User className="inline h-4 w-4 mr-2" />
          Perfil
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'password'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('password')}
        >
          <Lock className="inline h-4 w-4 mr-2" />
          Contraseña
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'account'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('account')}
        >
          <Trash2 className="inline h-4 w-4 mr-2" />
          Cuenta
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Información del Perfil</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </form>
        </Card>
      )}

      {/* Delete Account Tab */}
      {activeTab === 'account' && (
        <Card className="p-6 border-red-200">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Zona Peligrosa</h2>
          <p className="text-gray-600 mb-6">
            Eliminar tu cuenta es permanente y no se puede deshacer. Todos tus datos serán borrados.
          </p>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <Label htmlFor="deletePassword">Contraseña</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Tu contraseña"
              />
            </div>

            <div>
              <Label htmlFor="deleteConfirmation">
                Escribe <span className="font-bold">DELETE</span> para confirmar
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <Button
              type="submit"
              variant="destructive"
              disabled={loading || deleteConfirmation !== 'DELETE'}
            >
              {loading ? 'Eliminando...' : 'Eliminar Cuenta Permanentemente'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
