# Contexto del Proyecto - Cuentas Frontend

## 📋 Descripción General

**Cuentas** es una aplicación web de gestión de finanzas personales que permite a los usuarios tener control total de sus gastos, ingresos, tarjetas de crédito, deudas y transacciones.

### Funcionalidades Principales
- 💳 **Gestión de Cuentas:** Cash, banco, tarjetas de crédito
- 💰 **Transacciones:** Registrar gastos e ingresos
- 🏷️ **Categorías:** Clasificar transacciones por categoría
- 💸 **Gastos Fijos:** Configurar gastos e ingresos recurrentes mensuales
- 🎯 **Deudas:** Gestionar deudas con pagos e intereses
- 🔄 **Pagos Recurrentes:** Automatizar pagos de deudas
- 💳 **Tarjetas de Crédito:** Control de límites, fechas de corte y pagos
- 📊 **Dashboard:** Resumen visual de finanzas
- 📸 **Recibos:** Captura de imágenes de comprobantes (OCR)

## 🛠️ Stack Tecnológico

### Frontend (Este proyecto)
- **Framework:** React 19.2.4
- **Lenguaje:** TypeScript 5.9
- **Build Tool:** Vite 8
- **Styling:** TailwindCSS 4.2
- **Enrutamiento:** React Router DOM 7.13
- **Formularios:** React Hook Form 7.71 + Zod 4.3 (validación)
- **HTTP Client:** Axios 1.13.6
- **UI Components:** Lucide React (icons)
- **Gráficos:** Recharts 3.8
- **Drag & Drop:** @dnd-kit (sortable lists)
- **Otros:** date-fns, clsx, tailwind-merge

### Backend (Proyecto separado)
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 4.21
- **BD:** PostgreSQL con Prisma ORM 5.22
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod 3.23
- **File Upload:** Multer 2.1
- **OCR:** Tesseract.js 7
- **IA:** Anthropic SDK (para análisis)

## 📁 Estructura del Proyecto

```
src/
├── api/              # Clientes API para cada endpoint
├── components/       # Componentes React reutilizables
├── pages/           # Páginas de la aplicación
├── hooks/           # Custom hooks personalizados
├── context/         # Context API providers
├── types/           # Definiciones de tipos TypeScript
├── lib/             # Utilidades y helpers
├── assets/          # Imágenes, iconos
└── index.css        # Estilos globales
```

## 🔐 Autenticación

- **Tipo:** JWT (JSON Web Token)
- **Almacenamiento:** localStorage con clave 'token'
- **Interceptores:** Axios intercepta requests para añadir token Authorization header
- **Logout Automático:** Si el servidor retorna 401, se elimina el token y redirige a /login
- **Endpoints:** /api/auth/login, /api/auth/register

## 📊 Flujo de Datos Principal

```
Usuario → Componente → Hook (useX) → API Client → Axios → Backend
                       ↓
                   State (React)
                       ↓
                   UI Re-render
```

### Ejemplo: Obtener cuentas
1. Componente solicita datos con `useAccounts()`
2. Hook hace fetch a `accountsApi.getAll()`
3. API Client usa Axios con interceptor de token
4. Respuesta se guarda en estado local
5. UI se re-renderiza con los datos

## 🔄 Páginas de la Aplicación

| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/login` | Autenticación de usuario |
| Register | `/register` | Registro de nuevo usuario |
| Dashboard | `/` | Resumen de finanzas |
| Accounts | `/accounts` | Gestión de cuentas |
| Transactions | `/transactions` | Historial y creación de transacciones |
| Fixed Expenses | `/fixed-expenses` | Gastos/ingresos recurrentes |
| Categories | `/categories` | Gestión de categorías |
| Credit Cards | `/credit-cards` | Gestión de tarjetas de crédito |
| Debts | `/debts` | Gestión de deudas |
| Settings | `/settings` | Configuración de usuario |

## 🔗 Integración con Backend

- **Base URL:** Variable de entorno `VITE_API_URL` (default: http://localhost:3001/api)
- **Puerto de desarrollo:** 5173 (Vite)
- **CORS:** Configurado en backend para permitir requests desde frontend
- **Autenticación:** Bearer token en header `Authorization`

## 👥 Estado del Usuario

Actualmente se maneja con localStorage:
- Token JWT en `localStorage.token`
- No hay persistencia de datos de usuario en el cliente
- Context API disponible en `/src/context` para estado global si es necesario

## 🚀 Despliegue

- **Plataforma:** Vercel
- **Build:** `npm run build` (TypeScript compilation + Vite build)
- **Output:** Carpeta `dist/` con assets estáticos
- **Redireccionamiento:** Configurado en `public/_redirects` para SPA routing

## 📦 Dependencias Principales para Entender

### React Hook Form
- Gestión eficiente de formularios sin re-renders innecesarios
- Patrón: `const { register, handleSubmit, formState: { errors } } = useForm()`

### Zod
- Validación de esquemas en tiempo de compilación
- Se usa para validar datos del formulario antes de enviar

### Recharts
- Librería de gráficos para visualización en Dashboard
- Componentes: BarChart, LineChart, etc.

### @dnd-kit
- Drag & drop para ordenar gastos fijos
- Implementado en Fixed Expenses page

## 🔑 Variables de Entorno

```
VITE_API_URL=http://localhost:3001/api  # URL del backend en desarrollo
```

En producción (Vercel), se configura a través de variables de entorno del proyecto.

## 📞 Puntos de Integración Críticos

1. **Auth Interceptor** (`src/api/client.ts`) - Punto crítico de manejo de token
2. **API Clients** (`src/api/*.api.ts`) - Cada página tiene su cliente correspondiente
3. **Hooks** (`src/hooks/*.ts`) - Encapsulan lógica de fetching y estado
4. **Types** (`src/types/index.ts`) - Definiciones de tipos compartidas entre frontend y backend
