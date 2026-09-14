# Changelog

Todos los cambios notables de este proyecto se documentan en este fichero.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-14

### FEAT
* [#1](https://github.com/Jabbcode/cuentas_front/pull/1) add claude context structure for better documentation
* [#2](https://github.com/Jabbcode/cuentas_front/pull/2) add modular skills and agents documentation structure
* [#3](https://github.com/Jabbcode/cuentas_front/pull/3) FIX-001: Responsive button layout en TransactionsPage (mobile)
* [#4](https://github.com/Jabbcode/cuentas_front/pull/4) FIX-002: Corrección de cálculo de estado 'Vencido' en pagos recurrentes
* [#5](https://github.com/Jabbcode/cuentas_front/pull/5) add account type sections to accounts page
* [#10](https://github.com/Jabbcode/cuentas_front/pull/10) FEAT-007: Límites mensuales por categoría - UI
* [#11](https://github.com/Jabbcode/cuentas_front/pull/11) FEAT-008: UI para visualizar items de factura
* [#14](https://github.com/Jabbcode/cuentas_front/pull/14) FEAT-009: Transferencias entre cuentas
* [#15](https://github.com/Jabbcode/cuentas_front/pull/15) FEAT-010: Filtros avanzados en Transacciones
* [#16](https://github.com/Jabbcode/cuentas_front/pull/16) FEAT-011 - Presupuestos mensuales por categoría (Frontend)
* [#17](https://github.com/Jabbcode/cuentas_front/pull/17) UI de notificaciones y alertas (FEAT-013)
* [#18](https://github.com/Jabbcode/cuentas_front/pull/18) monthly comparison section in dashboard (FEAT-017)
* [#20](https://github.com/Jabbcode/cuentas_front/pull/20) Transacciones recurrentes automáticas UI (FEAT-015)
* [#21](https://github.com/Jabbcode/cuentas_front/pull/21) add tags UI (FEAT-016)
* [#22](https://github.com/Jabbcode/cuentas_front/pull/22) migrate auth pages to feature/auth and eliminate api duplicates
* [#23](https://github.com/Jabbcode/cuentas_front/pull/23) migrate CreditCardsPage to feature-based architecture
* [#24](https://github.com/Jabbcode/cuentas_front/pull/24) migrate BudgetsPage to feature-based architecture
* [#25](https://github.com/Jabbcode/cuentas_front/pull/25) migrate all feature modules to feature-based architecture
* [#26](https://github.com/Jabbcode/cuentas_front/pull/26) modal de transacciones por cuenta (FEAT-018)
* [#45](https://github.com/Jabbcode/cuentas_front/pull/45) logger + browserTracing para observabilidad completa
* [#47](https://github.com/Jabbcode/cuentas_front/pull/47) habilitar Sentry Logs panel
* [#52](https://github.com/Jabbcode/cuentas_front/pull/52) FIX-032 — JWT en httpOnly cookies (seguridad XSS)
* [#53](https://github.com/Jabbcode/cuentas_front/pull/53) REFACTOR-FE-003 — BudgetEmpty + DebtEmpty empty states con CTA
* [#54](https://github.com/Jabbcode/cuentas_front/pull/54) REFACTOR-FE-001 — cancelled flag en useEffect async (9 archivos)
* [#55](https://github.com/Jabbcode/cuentas_front/pull/55) REFACTOR-FE-005, FE-002, FE-004 — desacoplamiento y Pure UI
* [#56](https://github.com/Jabbcode/cuentas_front/pull/56) REFACTOR-FE-006 — Migrar server state a React Query (TanStack Query v5)
* [#57](https://github.com/Jabbcode/cuentas_front/pull/57) eliminar features Budgets y Tags del frontend
* [#58](https://github.com/Jabbcode/cuentas_front/pull/58) rediseño dashboard — jerarquía visual, alertas y tendencia mensual (FEAT-018)
* [#60](https://github.com/Jabbcode/cuentas_front/pull/60) pasada completa impeccable — diseño, a11y, perf y amber
* [#63](https://github.com/Jabbcode/cuentas_front/pull/63) crear gasto desde Tarjetas de Credito + visibilidad de errores de limite
* [#66](https://github.com/Jabbcode/cuentas_front/pull/66) unit coverage 88.6% + frontend E2E suite
* [#68](https://github.com/Jabbcode/cuentas_front/pull/68) gestión de versión y despliegues controlados por comando

### FIXES
* [#8](https://github.com/Jabbcode/cuentas_front/pull/8) Correct date calculations for fixed expenses and credit cards
* [#9](https://github.com/Jabbcode/cuentas_front/pull/9) Hide inactive credit cards and paid debts from fixed expenses view
* [#13](https://github.com/Jabbcode/cuentas_front/pull/13) FIX-010: Cambiar estado de botones de accion en formulario
* [#19](https://github.com/Jabbcode/cuentas_front/pull/19) mostrar período actual en tarjetas de crédito en pantalla de cuentas (FIX-011)
* [#29](https://github.com/Jabbcode/cuentas_front/pull/29) error handling UX — toast feedback + api-errors utility
* [#30](https://github.com/Jabbcode/cuentas_front/pull/30) FIX-020/021/022 — aria-label, toast feedback en cuentas y .env.example
* [#31](https://github.com/Jabbcode/cuentas_front/pull/31) FIX-019 — Error Boundary para prevenir desmontaje total de la app
* [#33](https://github.com/Jabbcode/cuentas_front/pull/33) FIX-019 Error Boundary + design polish (lang, font, touch targets)
* [#35](https://github.com/Jabbcode/cuentas_front/pull/35) FIX-023 — interceptor 401 usa evento custom auth:unauthorized
* [#36](https://github.com/Jabbcode/cuentas_front/pull/36) FIX-024 — error state en base hooks (silent catch eliminado)
* [#37](https://github.com/Jabbcode/cuentas_front/pull/37) FIX-029 — tests interceptors api/client.ts + setup vitest
* [#38](https://github.com/Jabbcode/cuentas_front/pull/38) FIX-030 — tests AuthContext (login, logout, register, checkAuth)
* [#39](https://github.com/Jabbcode/cuentas_front/pull/39) FIX-025 — ErrorCard UI en 7 páginas con retry
* [#40](https://github.com/Jabbcode/cuentas_front/pull/40) FIX-026 — distinguir error de red de credenciales inválidas en login
* [#41](https://github.com/Jabbcode/cuentas_front/pull/41) FIX-027 — instalar Sentry para error tracking en producción
* [#43](https://github.com/Jabbcode/cuentas_front/pull/43) configurar Sentry tunnel para evitar bloqueo por ad blockers
* [#51](https://github.com/Jabbcode/cuentas_front/pull/51) FIX-031 — tests useLoginPage + useAccounts + useTransactionsPage
* [#59](https://github.com/Jabbcode/cuentas_front/pull/59) corregir 4 tests pre-existentes rotos
* [#64](https://github.com/Jabbcode/cuentas_front/pull/64) habilitar preview deploys de Vercel para develop

### OTROS
* [#12](https://github.com/Jabbcode/cuentas_front/pull/12) CHORE-009: Configurar CI/CD, pre-commit hooks y Vercel
* [#32](https://github.com/Jabbcode/cuentas_front/pull/32) Prepare Release
* [#34](https://github.com/Jabbcode/cuentas_front/pull/34) Prepare Release
* [#42](https://github.com/Jabbcode/cuentas_front/pull/42) Prepare Release
* [#44](https://github.com/Jabbcode/cuentas_front/pull/44) Sentry tunnel + source maps + user context
* [#46](https://github.com/Jabbcode/cuentas_front/pull/46) logger + browserTracing + observabilidad completa
* [#48](https://github.com/Jabbcode/cuentas_front/pull/48) Sentry Logs panel habilitado
* [#49](https://github.com/Jabbcode/cuentas_front/pull/49) CHORE-010 — logger.info/error en mutaciones de page hooks
* [#50](https://github.com/Jabbcode/cuentas_front/pull/50) logger.info/error en mutaciones de page hooks
* [#61](https://github.com/Jabbcode/cuentas_front/pull/61) Prepare Release
* [#62](https://github.com/Jabbcode/cuentas_front/pull/62) limpiar config de Claude Code y migrar specs/plans al vault
* [#65](https://github.com/Jabbcode/cuentas_front/pull/65) documentar entorno de staging en project-state.md
* [#67](https://github.com/Jabbcode/cuentas_front/pull/67) Prepare Release
* [#70](https://github.com/Jabbcode/cuentas_front/pull/70) Release



## Comparaciones completas

- [61dbbf23c1088019c6924157fae93f00de1790bf...v0.1.0](https://github.com/Jabbcode/cuentas_front/compare/61dbbf23c1088019c6924157fae93f00de1790bf...v0.1.0)
