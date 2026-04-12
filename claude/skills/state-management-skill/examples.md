# Ejemplos: State Management

## ✅ Patrón Recomendado: Context + Custom Hook
Este es el estándar para crear estados globales o compartidos de forma segura.

```tsx
// 1. Definición de Interfaz
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

// 2. Creación del Contexto
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 3. Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((token: string) => {
    // Lógica de login
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout: () => setUser(null)
  }), [user, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook de Consumo Seguro
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

const [state, dispatch] = useReducer(cartReducer, initialState);

// Ejemplo de dispatch tipado
dispatch({ type: 'ADD_ITEM', payload: newItem });