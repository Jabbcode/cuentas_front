# 📊 Estado del Proyecto - Cuentas Frontend

**Archivo:** /claude/project-state.md
**Última actualización:** 2026-04-12
**Estado Global:** MVP Estable / Fase de Optimización y IA

---

## 🚀 Resumen Ejecutivo
Aplicación de gestión financiera con el núcleo transaccional 100% funcional. El foco actual es la integración de servicios inteligentes (OCR/IA) y la mejora de la robustez técnica (Testing/Performance).

---

## 📋 Roadmap de Funcionalidades

### ✅ Completadas (Core)
- Autenticación JWT + Registro.
- CRUD de Cuentas, Transacciones y Categorías.
- Gestión de Gastos Fijos y Deudas con pagos recurrentes.
- Tarjetas de Crédito (Límites y Fechas de corte).
- Dashboard visual con Recharts y validaciones Zod.

### 🔄 En Progreso (Sprint Actual)
- [ ] **OCR Engine:** Subida de recibos y extracción de datos con Tesseract.js.
- [ ] **IA Insights:** Análisis de patrones de gasto con Anthropic SDK.
- [ ] **Performance:** Virtualización de listas largas en el Dashboard.

### 📝 Pendiente (Backlog)
- [ ] Exportación de reportes (PDF/CSV).
- [ ] Modo Oscuro (Tailwind 4).
- [ ] Soporte Multimoneda.
- [ ] Alertas proactivas de deudas.

---

## 🔧 Estado Técnico y Deuda

### 🛠️ Stack Actualizado
- **React 19** | **Vite 6** | **TypeScript 5.7**
- **TailwindCSS 4.0** | **Axios 1.7**

### ⚠️ Deuda Técnica Crítica
1. **Testing (0%):** Prioridad ALTA. Es necesario implementar Vitest + React Testing Library.
2. **Dashboard Performance:** Se vuelve lento con +1000 registros. Requiere `react-window` o similar.
3. **Tipado:** Refinar interfaces en `src/types/index.ts` para eliminar redundancias.

---

## 📊 Métricas de Salud
- **Performance (Lighthouse):** 85/100 (Target: >90).
- **Bundle Size:** ~500KB (Target: <400KB).
- **Seguridad:** JWT implementado. Pendiente: Sanitización de inputs avanzada.

---

## 🐛 Bugs Conocidos
- **Menor:** El layout móvil sufre desbordamiento (overflow) en el panel de acciones rápidas.
- **Menor:** Algunos gráficos de Recharts no se re-dimensionan correctamente sin refrescar.

---

## 🎯 Próximos Pasos Inmediatos
1. **Estabilidad:** Configurar infraestructura de tests unitarios.
2. **UX:** Corregir los detalles de responsive design identificados.
3. **Feature:** Finalizar el flujo de "Escanear Factura".

---
**Nota para Claude:** Antes de iniciar cualquier tarea, verifica si afecta a un área con "Deuda Técnica" para intentar solventarla durante la implementación.