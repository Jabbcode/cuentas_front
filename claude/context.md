# 🏦 Contexto del Proyecto: Cuentas Frontend

## 📝 Descripción General
**Cuentas** es una plataforma de gestión financiera personal. El objetivo es centralizar el control de activos (efectivo, bancos) y pasivos (tarjetas, deudas) con automatización de flujos recurrentes y análisis visual mediante IA y OCR.

---

## 🛠️ Stack Tecnológico (Core)

### Frontend
- **Framework:** React 19.0 (Uso de APIs modernas y optimización de renderizado).
- **Build Tool:** Vite 6.0 + TypeScript 5.7.
- **Styling:** TailwindCSS 4.0 (Configuración basada en CSS y alto rendimiento).
- **UI Components:** shadcn/ui (Basado en Radix UI + Lucide Icons).
- **Forms & Validation:** React Hook Form 7.54 + Zod 3.24.
- **Networking:** Axios 1.7 con Interceptores para gestión de JWT.
- **Visualización:** Recharts 3.8 para análisis financiero.
- **Interacción:** @dnd-kit para reordenamiento de elementos (Fixed Expenses).

### Backend (Referencia para Integración)
- **API:** RESTful Express + Node.js (TypeScript).
- **Auth:** JWT (Bearer Token) almacenado en `localStorage`.
- **Base de Datos:** PostgreSQL + Prisma ORM.

---

## 📂 Arquitectura de Directorios (Source of Truth)

```text
src/
├── api/          # Instancia de Axios y servicios (Ej: auth.api.ts, accounts.api.ts)
├── components/   # UI Atómica y Compuesta
│   ├── ui/       # Componentes base de shadcn/ui (No editar directamente)
│   ├── shared/   # Componentes de negocio reutilizables (Modales, Cards de transacciones)
│   └── layout/   # Estructura global (Navbar, Sidebar, PageWrapper)
├── pages/        # Vistas principales vinculadas a rutas
├── hooks/        # Lógica de fetching y estados complejos (useTransactions, useAuth)
├── context/      # Providers globales (AuthContext, ThemeContext)
├── types/        # Interfaces, Types y Enums de TypeScript (index.ts)
├── lib/          # Configuración de utilidades (utils.ts con la función 'cn')
└── assets/       # Recursos estáticos (Imágenes, SVG)
```
---

## 🔐 Protocolo de Seguridad y Autenticación

- **JWT Flow:** Se utiliza el header `Authorization: Bearer <token>` en todas las peticiones privadas.
- **Persistencia:** El token se almacena en `localStorage` bajo la clave `token`.
- **Manejo de Sesión:**
    - El interceptor de Axios (`src/api/client.ts`) inyecta el token automáticamente.
    - Si el servidor responde con **401 (Unauthorized)**, el frontend debe limpiar el `localStorage` y redirigir inmediatamente a `/login`.

---

## 📐 Estándares de Desarrollo (Reglas Críticas)

1. **Tipado Estricto:** Prohibido el uso de `any`. Toda respuesta de API y payload debe estar definido en `src/types`.
2. **Separación de Capas:**
    - **Pages:** Solo orquestan componentes y hooks. No contienen lógica de Axios.
    - **Hooks:** Manejan el estado y la llamada al servicio.
    - **API Clients:** Solo definen el endpoint y el método HTTP.
3. **Naming Convention:**
    - **Componentes:** `PascalCase.tsx`.
    - **Hooks/Utils:** `camelCase.ts`.
    - **Estilos:** Priorizar utilidades de Tailwind sobre CSS plano.
4. **Tailwind & shadcn/ui:**
    - Usar la utilidad `cn()` para la concatenación de clases condicionales.
    - Respetar el diseño **Mobile-first** usando los breakpoints de Tailwind (`md:`, `lg:`).

---

## 🔄 Flujos de Datos Críticos

### Gestión de Transacciones e Ingresos
1. El usuario completa el formulario (validado por **Zod** vía **React Hook Form**).
2. Se invoca el servicio API correspondiente.
3. Tras la respuesta exitosa (200/201), se debe actualizar el estado global o local para que los gráficos de **Recharts** y los balances se refresquen automáticamente.

---

## 📞 Integración y Variables de Entorno
- **Base URL:** Se define en `VITE_API_URL` (Ej: `http://localhost:3001/api`).
- **Puerto Dev:** 5173.
- **OCR/IA:** El procesamiento de recibos se realiza enviando `FormData` al backend, el cual utiliza Tesseract.js y Anthropic SDK.

---

## 📌 Roadmap de Implementación
- [ ] Dashboards interactivos con filtros de fecha.
- [ ] Gestión avanzada de tarjetas de crédito (fechas de corte y pago).
- [ ] Automatización de pagos recurrentes y deudas con interés.
- [ ] Optimización de carga de imágenes para recibos.