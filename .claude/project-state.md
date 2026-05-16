# Estado del Proyecto - Cuentas Frontend

Documento vivo del estado actual del proyecto. Actualizar regularmente.

## 📅 Fecha de Actualización

**Última actualización:** 2026-05-16

## 🚀 Estado General

Aplicación en desarrollo activo con funcionalidades core implementadas.

## 📋 Funcionalidades Implementadas

### ✅ Completadas

- [x] Autenticación (Login/Register)
- [x] Gestión de Cuentas (cash, banco, tarjeta crédito)
- [x] Transacciones (CRUD completo)
- [x] Categorías (CRUD)
- [x] Gastos Fijos Mensuales
- [x] Deudas (CRUD + pagos)
- [x] Pagos Recurrentes de Deudas
- [x] Tarjetas de Crédito (límites, fechas de corte)
- [x] Dashboard de resumen
- [x] Gráficos con Recharts
- [x] Validación con Zod
- [x] **Presupuestos mensuales por categoría** (FEAT-011 — 2026-04-21)
- [x] **Sistema de notificaciones y alertas** (FEAT-013 — 2026-04-21) — campana en navbar/sidebar, panel dropdown responsive, toasts globales con Sonner, preferencias en Settings
- [x] **FIX-011 (2026-04-24):** AccountCard muestra disponible del período actual (no vencido), badge rojo si período vencido sin pagar; balance total en AccountsPage descuenta períodos vencidos y muestra nota informativa en amber
- [x] **REFACTOR-accounts (2026-05-01):** AccountsPage refactorizado de 480 → 115 líneas siguiendo Pure UI Rule — nuevos archivos: `types/accounts.types.ts`, `lib/accounts.utils.ts`, `components/accounts/AccountFormDialog.tsx`, `components/accounts/AccountTypeSection.tsx`; `useAccountsPage.ts` limpio importando desde utils y types; `useAccounts.ts` simplificado (eliminado `totalBalance` sin consumidores)
- [x] **FEAT-015 (PR front #20):** Toggle "Auto-generar" en formulario de gasto fijo; badge en transacciones auto-generadas
- [x] **FEAT-017:** Widget `MonthComparisonCard` en dashboard — totales mes actual vs anterior con flechas de tendencia
- [x] **FEAT-018 (PR front #26):** `AccountTransactionsModal` — historial de transacciones por cuenta desde AccountCard; `useAccountTransactions` hook; patrón Pure UI; referencia: `CreditCardTransactionsModal`
- [x] **FEAT-009 (PR #14):** Transferencias entre cuentas — formulario + flujo completo
- [x] **FEAT-010 (PR #15):** Filtros avanzados en TransactionsPage — filtros servidor-side migrados a feature
- [x] **FEAT-016 (PR #21):** Tags UI — input con autocompletado, `TagBadge`, filtro por tag en TransactionsPage; bug fixes en PR separado
- [x] **Refactor Feature-Module (PRs #22–#25):** migración completa de auth, budgets, credit-cards, debts, fixed-expenses, settings, transactions, dashboard a `src/features/<module>/` — Pure UI Rule, hooks, utils, types por módulo; `__tests__/` con utils de accounts, debts, fixed-expenses
- [x] **FEAT-banking-sync (PR front #28):** `useBanking`, `useBankMapping`, `BankConnectionBadge`, `BankingMapPage` (`/banking/map`); integración en `AccountCard` / `AccountTypeSection` / `useAccountsPage`

### 🔄 En Progreso / Review

- [ ] **FEAT-004:** Modo dark — PR #7 abierto; TailwindCSS class strategy, `ThemeContext`, `ThemeToggle`, localStorage
- [ ] **FEAT-banking-sync:** Bloqueado en producción — providers España pendientes en TrueLayer Console

### 📝 Pendiente

- [ ] FEAT-016: Tags en transacciones — input con autocompletado, `TagBadge`, filtro por tag (depende de REFACTOR-BE-001 en backend)
- [ ] FEAT-014: Metas de ahorro — sección Metas + widget dashboard + barra progreso circular
- [ ] FEAT-012: Exportar datos CSV/PDF — botón en TransactionsPage + modal con filtros
- [ ] Múltiples monedas

## 🐛 Bugs Conocidos

### Críticos

- (Ninguno reportado)

### Menores

- Dashboard puede ser lento con 1000+ transacciones
- Mobile responsive: ajustar en pantallas < 640px

## 🔧 Deuda Técnica

### TypeScript

- ✅ Sin `any` en el código actual
- ⚠️ Algunos tipos podrían ser más específicos en index.ts

### Testing

- ❌ Sin tests unitarios (0% cobertura)
- ❌ Sin tests de integración
- **Prioridad:** Media (agregar en próximos sprints)

### Performance

- Dashboard renders lento con 1000+ transacciones
- Considerar: React.memo, useMemo, o virtualización

### Documentación

- ✅ Código documentado en componentes complejos
- ⚠️ Faltan ejemplos de uso en README

## 📊 Métricas

### Bundle Size

- Build actual: ~500KB (gzipped)
- Target: < 400KB

### Performance (Lighthouse)

- Performance: 85/100
- Accessibility: 95/100
- Best Practices: 90/100
- SEO: 80/100

## 🔐 Estado de Seguridad

### Implementado

- ✅ JWT autenticación
- ✅ Token en localStorage
- ✅ CORS configurado
- ✅ Validación frontend con Zod

### Pendiente

- [ ] CSRF tokens
- [ ] Rate limiting (backend)
- [ ] Sanitización de inputs
- [ ] Testing de seguridad

## 📦 Dependencias

### Versiones Actuales

- React: 19.2.4
- TypeScript: 5.9
- Vite: 8
- TailwindCSS: 4.2
- Axios: 1.13.6
- Sonner: (toast notifications)

### Vulnerabilidades Conocidas

- ✅ Sin vulnerabilidades críticas
- Run: `npm audit` regularmente

## 🎯 Próximas Prioridades

### Sprint Actual

1. [ ] **FEAT-004** — Merge PR #7 modo dark (abierto desde 2026-04-12)
2. [ ] Completar PR #27 — Proyecciones financieras (WIP)
3. [ ] Desbloquear FEAT-banking-sync en prod (TrueLayer Console España)

### Próximos Sprints

1. [ ] FEAT-014 — Metas de ahorro (sección Metas, widget dashboard, barra progreso circular)
2. [ ] FEAT-012 — Exportación CSV/PDF (botón en TransactionsPage + modal filtros)

## 👥 Equipo y Roles

- **Desarrollador Principal:** Tu nombre
- **Backend:** Tu nombre (repo cuentas_back)
- **Design:** (Si aplica)

## 🔗 Enlaces Importantes

- **Backend:** https://github.com/Jabbcode/cuentas_back
- **Kanban/Tareas:** (Agregar si existe)
- **Despliegue:** Vercel (https://...)

## 📝 Notas de Desarrollo

### Patrones Establecidos

- Custom hooks para lógica de datos
- API clients abstractos
- Componentes funcionales con TypeScript
- Widgets de dashboard auto-contenidos que fetchan sus propios datos (ver `BudgetDashboardWidget`)

### Decisiones Arquitectónicas

- Context API sobre Redux (simplicidad)
- TailwindCSS sobre Styled Components
- Zod para validación (type-safe)

### Problemas a Solucionar

1. Dashboard lento → considerar virtualización
2. Tests: agregar cobertura mínima 70%
3. Bundle size: analizar con Vite visualizer

## 🚢 Despliegue

### Ambiente

- **Dev:** Local con npm run dev
- **Staging:** (Si existe)
- **Producción:** Vercel

### Variables de Entorno Necesarias

```
VITE_API_URL=<backend-url>
```

### Proceso de Deploy

1. Push a rama develop/main
2. Vercel detecta cambios
3. Build automático
4. Deploy a staging/producción

## 📈 Roadmap a Largo Plazo

### Q1 2024

- [ ] MVP completo y estable
- [ ] Documentación básica
- [ ] Primeros usuarios reales

### Q2 2024

- [ ] Análisis IA
- [ ] Mobile app (React Native)
- [ ] Integración con bancos

### Q3 2024

- [ ] Soporte múltiples monedas
- [x] ~~Presupuestos y metas~~ → Presupuestos implementados (FEAT-011)
- [ ] Reportes avanzados

## 📞 Contactos para Preguntas

- **Errores de desarrollo:** Revisar github issues
- **Decisiones arquitectónicas:** Ver carpeta `decisions/`
- **Estado actual:** Este archivo

---

**Nota:** Este documento se actualiza regularmente. Si notas información desactualizada, abre un issue o actualiza directamente en PR.
