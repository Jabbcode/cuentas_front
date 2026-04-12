# Ejemplos: Data Fetching (Axios + JWT)

## ❌ Mal Patrón: Llamada directa en el Componente
Este patrón es difícil de testear y ensucia la UI con lógica de red.

```tsx
// MAL: Lógica de red mezclada con UI y tipado pobre
const fetchUsers = async () => {
  const res = await axios.get('[https://api.site.com/users](https://api.site.com/users)'); // URL hardcoded
  setUsers(res.data);
};

// BIEN: Servicio tipado (services/userService.ts)
import api from '../api/client';

export interface UserResponse {
  id: string;
  email: string;
}

export const getUsers = () => api.get<UserResponse[]>('/users');

// api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

try {
  const { data } = await getUsers();
  setUsers(data);
} catch (error) {
  const message = axios.isAxiosError(error) 
    ? error.response?.data.message 
    : 'Error inesperado';
  toast.error(message);
}
