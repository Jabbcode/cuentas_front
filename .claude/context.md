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
├── features/<module>/  # Dominio: index.ts (barrel), types.ts, utils.ts, api.ts, hooks/, components/
├── pages/               # Páginas — solo importan desde el barrel del feature
├── components/          # Componentes UI compartidos (no específicos de un feature)
├── context/             # Context API providers
├── types/                # Definiciones de tipos TypeScript compartidas
├── lib/                  # Utilidades y helpers
├── assets/               # Imágenes, iconos
└── index.css             # Estilos globales
```

Ver ADR-008 en `.claude/decisions/ADR-decisions.md` para el detalle de la estructura de cada feature.

## 🔐 Autenticación

- **Tipo:** JWT (JSON Web Token) en cookie **httpOnly** gestionada por el backend
- **Almacenamiento:** Ninguno en el cliente — no localStorage, no Context. La cookie es invisible para JS
- **Envío:** Axios con `withCredentials: true` — el browser adjunta la cookie automáticamente
- **Verificación de sesión:** `AuthContext` llama `GET /auth/me` al montar; si falla, no autenticado
- **Logout Automático:** Response interceptor dispara el evento `auth:unauthorized` en 401 → `AuthContext` limpia el estado
- **Endpoints:** `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`

Ver ADR-002 y ADR-011 en `.claude/decisions/ADR-decisions.md`.

## 📊 Flujo de Datos Principal

```
Usuario → Componente → Hook (useX) → API Client → Axios (withCredentials) → Backend
                       ↓
                   State (React)
                       ↓
                   UI Re-render
```

### Ejemplo: Obtener cuentas

1. Componente solicita datos con `useAccounts()`
2. Hook hace fetch a `accountsApi.getAll()`
3. API Client usa Axios con `withCredentials: true` (cookie httpOnly enviada automáticamente)
4. Respuesta se guarda en estado local
5. UI se re-renderiza con los datos

## 🔄 Páginas de la Aplicación

| Página         | Ruta              | Descripción                           |
| -------------- | ----------------- | ------------------------------------- |
| Login          | `/login`          | Autenticación de usuario              |
| Register       | `/register`       | Registro de nuevo usuario             |
| Dashboard      | `/`               | Resumen de finanzas                   |
| Accounts       | `/accounts`       | Gestión de cuentas                    |
| Transactions   | `/transactions`   | Historial y creación de transacciones |
| Fixed Expenses | `/fixed-expenses` | Gastos/ingresos recurrentes           |
| Categories     | `/categories`     | Gestión de categorías                 |
| Credit Cards   | `/credit-cards`   | Gestión de tarjetas de crédito        |
| Debts          | `/debts`          | Gestión de deudas                     |
| Settings       | `/settings`       | Configuración de usuario              |

## 🔗 Integración con Backend

- **Base URL:** Variable de entorno `VITE_API_URL` (default: http://localhost:3001/api)
- **Puerto de desarrollo:** 5173 (Vite)
- **CORS:** Configurado en backend con `credentials: true` para aceptar la cookie httpOnly
- **Autenticación:** Cookie httpOnly + `withCredentials: true` (sin header Authorization)

## 👥 Estado del Usuario

- Sin token ni datos de sesión en localStorage
- `AuthContext` (`/src/context/AuthContext.tsx`) mantiene `user` en memoria, verificado contra `GET /auth/me` al montar
- No hay persistencia de datos de usuario en el cliente entre recargas más allá de esa verificación

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

1. **API Client base** (`src/api/client.ts`) - Configuración Axios con `withCredentials: true`
2. **API Clients por feature** (`src/features/<module>/api.ts`) - Cliente HTTP de cada dominio
3. **Hooks por feature** (`src/features/<module>/hooks/*.ts`) - Encapsulan lógica de fetching y estado
4. **Types** (`src/types/index.ts`) - Definiciones de tipos compartidas entre frontend y backend
