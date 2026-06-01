# Estado del Proyecto - Cuentas Frontend

Documento vivo del estado actual del proyecto. Actualizar regularmente.

## 📅 Fecha de Actualización

**Última actualización:** 2026-06-01

## 🚀 Estado General

Aplicación en producción activa. Arquitectura feature-module completa. Observabilidad con Sentry + logger operativa. JWT migrado a httpOnly cookies.

## 📋 Funcionalidades Implementadas

### ✅ Completadas

- [x] Autenticación (Login/Register) — JWT en httpOnly cookie, sin localStorage
- [x] Gestión de Cuentas (cash, banco, tarjeta crédito)
- [x] Transacciones (CRUD completo)
- [x] Categorías (CRUD)
- [x] Gastos Fijos Mensuales (con drag & drop)
- [x] Deudas (CRUD + pagos)
- [x] Pagos Recurrentes de Deudas
- [x] Tarjetas de Crédito (límites, fechas de corte)
- [x] Dashboard de resumen + gráficos Recharts
- [x] Validación con Zod + React Hook Form
- [x] **Presupuestos mensuales** (FEAT-011)
- [x] **Notificaciones** (FEAT-013) — campana navbar, panel dropdown, toasts Sonner, preferencias
- [x] **FIX-011:** AccountCard disponible período actual; balance descuenta períodos vencidos
- [x] **Refactor accounts** (2026-05-01) — Pure UI Rule; AccountFormDialog, AccountTypeSection, useAccountsPage
- [x] **FEAT-015:** Toggle auto-generar en gasto fijo; badge en transacciones auto-generadas
- [x] **FEAT-017:** Widget MonthComparisonCard en dashboard
- [x] **FEAT-018:** AccountTransactionsModal — historial por cuenta desde AccountCard
- [x] **FEAT-009:** Transferencias entre cuentas
- [x] **FEAT-010:** Filtros avanzados en TransactionsPage (server-side)
- [x] **FEAT-016:** Tags — input autocompletado, TagBadge, filtro por tag
- [x] **Refactor Feature-Module (PRs #22–#25):** migración completa a `src/features/<module>/` — auth, budgets, credit-cards, debts, fixed-expenses, settings, transactions, dashboard
- [x] **FEAT-banking-sync (PR #28):** useBanking, useBankMapping, BankConnectionBadge, BankingMapPage
- [x] **FIX-019 (PR #33):** Error Boundary global + design polish (lang, font, touch targets)
- [x] **FIX-023 (PR #35):** interceptor 401 usa evento custom `auth:unauthorized`
- [x] **FIX-024 (PR #36):** error state en base hooks, silent catch eliminado
- [x] **FIX-025 (PR #39):** ErrorCard UI en 7 páginas con retry
- [x] **FIX-026 (PR #40):** distinción error de red vs credenciales inválidas en login
- [x] **FIX-027 (PR #41):** Sentry instalado — error tracking, source maps, user context
- [x] **Sentry tunnel (PR #43):** proxy `/api/monitoring/sentry-tunnel` para evitar ad blockers
- [x] **Observabilidad (PR #45):** logger utility + browserTracing + Sentry Logs panel
- [x] **CHORE-010 (PR #49):** logger.info/error en mutaciones de 8 page hooks
- [x] **FIX-029 (PR #37):** tests interceptors api/client.ts + setup vitest
- [x] **FIX-030 (PR #38):** tests AuthContext
- [x] **FIX-031 (PR #51):** 10 tests nuevos — useLoginPage, useAccounts, useTransactionsPage
- [x] **FIX-032 (PR #52):** JWT en httpOnly cookie — sin localStorage, withCredentials: true, logout API

### 📝 Pendiente

- [ ] **FEAT-004** — Modo dark (PR #7 abierto desde 2026-04-12)
- [ ] **REFACTOR-FE-003** — BudgetEmpty + DebtEmpty empty states con CTA
- [ ] **FEAT-014** — Metas de ahorro
- [ ] **FEAT-012** — Exportación CSV/PDF
- [ ] FEAT-banking-sync: Bloqueado en prod (providers España pendientes en TrueLayer)

## 🐛 Bugs Conocidos

- Dashboard puede ser lento con 1000+ transacciones
- Mobile responsive: ajustar en pantallas < 640px

## 🔐 Estado de Seguridad

- ✅ JWT en httpOnly cookie (FIX-032) — no accesible desde JavaScript
- ✅ `withCredentials: true` en Axios — cookies enviadas automáticamente
- ✅ Sin token en localStorage
- ✅ Interceptor 401 → evento `auth:unauthorized` → logout (FIX-023)
- ✅ Error Boundary global (FIX-019)
- ✅ Sentry error tracking en producción (FIX-027)
- [ ] CSRF tokens (pendiente)

## 🧪 Testing

- ✅ Vitest configurado
- ✅ Tests: useLoginPage, useAccounts, useTransactionsPage, AuthContext, api/client interceptors
- ⚠️ Cobertura parcial — prioridad media

## 🌐 Despliegue

- **Frontend:** Vercel — https://cuentas-front-amber.vercel.app
- **Backend:** Render — https://cuentas-back-fgep.onrender.com
- **VITE_API_URL:** https://cuentas-back-fgep.onrender.com/api

## 📊 Cambios Recientes

- **FIX-032 (PR #52 — 2026-06-01):** JWT a httpOnly cookie; AuthContext sin localStorage; authApi.logout(); AuthResponse sin token; 7 tests actualizados
- **FIX-031 (PR #51 — 2026-06-01):** 10 tests nuevos con renderHook + vi.hoisted; patrón de mocks para hooks con muchas dependencias
- **CHORE-010 (PR #49 — 2026-06-01):** logger.info/error en 8 page hooks (accounts, categories, transactions, budgets, debts, credit-cards, fixed-expenses)
- **Observabilidad (PRs #41–#47 — 2026-06-01):** Sentry + source maps + user context + tunnel + logger + Logs panel
- **FIX-019→FIX-030 (PRs #33–#40 — 2026-06-01):** Error Boundary, ErrorCard, interceptor 401 custom event, silent catch eliminado, distinción error de red
