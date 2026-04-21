# Decisions - Cuentas Frontend

Registro de decisiones arquitectónicas importantes tomadas en el proyecto.

## ADR-001: Usar Context API en lugar de Redux

**Fecha:** 2024
**Estado:** Aceptada
**Autores:** Equipo de desarrollo

### Problema

¿Cómo manejar estado global (autenticación, tema, configuración)?

### Contexto

- Proyecto mediano de ~20 componentes
- Datos globales: user, tema, idioma
- La mayoría de datos son del servidor (no estado local)

### Opciones Consideradas

1. **Redux** - Completo pero overhead para proyecto pequeño
2. **Zustand** - Ligero pero menos convenciones
3. **Context API** - Built-in, suficiente para nuestro caso
4. **Local Storage** - No es solución a nivel de aplicación

### Decisión

**Usar Context API** para estado global

### Justificación

- ✅ Built-in en React, sin dependencias
- ✅ Suficiente para nuestro volumen de estado
- ✅ Más simple de aprender para nuevos desarrolladores
- ✅ Menos boilerplate que Redux

### Consecuencias

- ✅ Estado global fácil de entender
- ⚠️ Potencial prop drilling si estado crece mucho
- ⚠️ Todos los cambios re-renderizan subscribers
  - Mitigación: Dividir Context por dominio (Auth, Theme, etc)

---

## ADR-002: Axios para HTTP Client

**Fecha:** 2024
**Estado:** Aceptada

### Problema

¿Cómo hacer requests HTTP al backend?

### Contexto

- Necesidad de interceptores (añadir token)
- Manejo centralizado de errores 401
- TypeScript typing para requests/responses

### Opciones Consideradas

1. **Fetch API** - Built-in pero verbose
2. **Axios** - Librería, muchas features
3. **React Query** - Excelente para caching, sobre-engineered

### Decisión

**Usar Axios** + abstracción en api clients

### Justificación

- ✅ Interceptores para token y errores
- ✅ Sintaxis limpia
- ✅ Manejo de CancelToken para cleanup
- ✅ TypeScript support excelente

### Consecuencias

- ✅ Centralización de requests
- ✅ Interceptor de 401 automático
- ⚠️ Dependencia externa (pero bien mantenida)

---

## ADR-003: Zod para Validación de Formularios

**Fecha:** 2024
**Estado:** Aceptada

### Problema

¿Cómo validar datos de formularios y del servidor?

### Contexto

- Validación tanto frontend como backend
- Necesidad de mantener tipos en sync
- Mensajes de error claros

### Opciones Consideradas

1. **Manual validation** - Error-prone
2. **Yup** - Bueno pero apiado
3. **Zod** - Muy bueno con TypeScript
4. **Joi** - Overkill para frontend

### Decisión

**Usar Zod** + react-hook-form

### Justificación

- ✅ Type-safe: extrae tipos automáticamente
- ✅ Composable: schemas reutilizables
- ✅ TypeScript-first design
- ✅ Mensajes de error claros

### Consecuencias

- ✅ Seguridad de tipos
- ✅ Validación consistente
- ✅ Frontend y backend en sync
- ⚠️ Pequeña curva de aprendizaje inicial

---

## ADR-004: TailwindCSS en lugar de Styled Components

**Fecha:** 2024
**Estado:** Aceptada

### Problema

¿Cómo estilizar componentes de manera escalable?

### Contexto

- Proyecto que requiere estilos consistentes
- Múltiples componentes con estilos similares
- Balance entre flexibilidad y mantenibilidad

### Opciones Consideradas

1. **CSS modules** - Buen aislamiento, verbose
2. **Styled Components** - JS-in-CSS, popular
3. **TailwindCSS** - Utility-first, apoyado por comunidad
4. **BEM CSS** - Convenciones, poco escalable

### Decisión

**Usar TailwindCSS 4** + componentes Tailwind

### Justificación

- ✅ Bundle size pequeño (utility classes)
- ✅ Rápido de desarrollar
- ✅ Temas, dark mode fácil
- ✅ Comunidad activa, recursos abundantes
- ✅ Customizable via tailwind.config.js

### Consecuencias

- ✅ Desarrollo muy rápido
- ✅ Estilos mantenibles
- ⚠️ Clases HTML pueden ser largas (mitigación: use clsx)
- ⚠️ Necesita disciplina para no mezclar estilos

---

## ADR-005: React Custom Hooks sobre Renderless Components

**Fecha:** 2024
**Estado:** Aceptada

### Problema

¿Cómo compartir lógica stateful entre componentes?

### Contexto

- Múltiples componentes necesitan misma lógica (fetch, filters)
- Componentes presentacionales vs contenedores
- Code reuse sin duplicación

### Opciones Consideradas

1. **Render props** - Overkill para nuestro caso
2. **HOC (High Order Components)** - Antigua, complicada
3. **Custom Hooks** - Moderna, limpia
4. **Composición de funciones** - Muy funcional

### Decisión

**Usar Custom Hooks** para lógica compartida

### Justificación

- ✅ Modern React pattern
- ✅ Simpler than HOC o render props
- ✅ Composable: hooks usan otros hooks
- ✅ Fácil de testear
- ✅ TypeScript support nativo

### Consecuencias

- ✅ Código limpio y reutilizable
- ✅ Testing más simple
- ⚠️ Requires discipline (hooks rules)

---

## ADR-006: TypeScript en Strict Mode

**Fecha:** 2024
**Estado:** Aceptada

### Problema

¿Cómo asegurar type safety máxima?

### Contexto

- Aplicación medianas que crece
- Muchas integraciones entre módulos
- Necesidad de refactorings seguros

### Opciones Consideradas

1. **Sin TypeScript** - Flexible pero riesgoso
2. **TypeScript con any** - Tiene holes
3. **TypeScript strict** - Máxima seguridad
4. **JSDoc** - Ligero pero menos potente

### Decisión

**TypeScript strict mode, sin `any`**

### Justificación

- ✅ Catch errors en compile time
- ✅ Mejor IDE support
- ✅ Documentación vía tipos
- ✅ Refactorings más seguros

### Consecuencias

- ✅ Menos bugs en runtime
- ✅ Mejor developer experience
- ⚠️ Desarrollo más lento inicialmente
- ⚠️ Curva de aprendizaje TypeScript

---

## ADR-007: Vite como Build Tool

**Fecha:** 2024
**Estado:** Aceptada

### Problema

¿Cómo hacer build y dev server?

### Contexto

- Necesidad de dev server rápido
- Build optimizado para producción
- Soporte para TypeScript, JSX

### Opciones Consideradas

1. **Create React App** - Out of the box, lento
2. **Webpack** - Flexible, configuración compleja
3. **Vite** - Super rápido, moderno
4. **Parcel** - Zero config, menos control

### Decisión

**Usar Vite 8**

### Justificación

- ✅ Dev server instantáneo (HMR)
- ✅ Build muy rápido
- ✅ Zero config para nuestra stack
- ✅ Soporte nativo para ES modules
- ✅ Rollup para build production

### Consecuencias

- ✅ Desarrollo rapidísimo
- ✅ Build size optimizado
- ⚠️ Menos comunidad que Webpack
- ⚠️ Menos plugins disponibles

---

## ADR-008: Resend para Email Transaccional

**Fecha:** 2026-04-21
**Estado:** Aceptada

### Problema

¿Cómo enviar emails transaccionales (resúmenes mensuales) desde el backend?

### Contexto

- FEAT-013 requiere enviar un email HTML con resumen financiero mensual
- Necesidad de templates HTML con estilos inline
- Sin infraestructura de email propia

### Opciones Consideradas

1. **Nodemailer** - Popular, requiere configurar SMTP (Gmail, SendGrid, etc.)
2. **Resend** - SDK moderno, API key directo, buen soporte HTML
3. **SendGrid** - Enterprise, más complejo para proyecto pequeño

### Decisión

**Usar Resend** con SDK oficial

### Justificación

- ✅ Setup mínimo (solo API key)
- ✅ SDK TypeScript-first
- ✅ Dashboard con logs de emails enviados
- ✅ No requiere configurar servidor SMTP
- ✅ Free tier suficiente para uso actual

### Consecuencias

- ✅ Envío de email en <5 líneas de código
- ⚠️ Dependencia de servicio externo (Resend)
- ⚠️ Requiere dominio verificado para producción

---

## ADR-009: Budget como Fuente de Verdad para Límites de Gasto

**Fecha:** 2026-04-21
**Estado:** Aceptada

### Problema

¿Dónde vive el límite de gasto por categoría — en `Category.monthlyLimit` o en el modelo `Budget`?

### Contexto

- `Category` tiene campo `monthlyLimit` (legado)
- `Budget` tiene `amount`, `month`, `year`, `alertAt` (más completo, por mes/año)
- FEAT-013 necesita disparar notificaciones cuando se supera un límite
- El sistema de notificaciones verificaba `category.monthlyLimit` pero los usuarios configuraban límites en Budgets

### Decisión

**Budget es la única fuente de verdad** para límites de gasto. `checkBudgetAndNotify` consulta únicamente el modelo Budget.

### Justificación

- ✅ Budget es más expresivo (límite específico por mes/año)
- ✅ Evita divergencia entre dos fuentes de verdad
- ✅ Consistente con cómo los usuarios ya configuran límites en la UI
- ✅ Budget tiene `alertAt` para alertas tempranas (ej. al 80%)

### Consecuencias

- ✅ Notificaciones confiables y consistentes con lo que el usuario configura
- ⚠️ `Category.monthlyLimit` queda como campo legado (pendiente REFACTOR-001 para eliminarlo)
- ⚠️ Si el usuario no tiene Budget para una categoría, no hay notificación de límite

---

## Cómo Agregar Nueva Decisión

Cuando tomes una decisión arquitectónica importante:

1. Crea nuevo archivo `ADR-NNN: descripcion.md`
2. Usa template:

   ```markdown
   # ADR-NNN: Título de la Decisión

   **Fecha:** AAAA-MM-DD
   **Estado:** Propuesta/Aceptada/Deprecada
   **Autores:** Nombres

   ### Problema

   ### Contexto

   ### Opciones Consideradas

   ### Decisión

   ### Justificación

   ### Consecuencias
   ```

3. Abre PR documentando la decisión
4. Agrupa por proyecto (Frontend/Backend)

---

## Estado Actual

### Decisiones Activas: 9

- ADR-001: Context API ✅
- ADR-002: Axios ✅
- ADR-003: Zod ✅
- ADR-004: TailwindCSS ✅
- ADR-005: Custom Hooks ✅
- ADR-006: TypeScript Strict ✅
- ADR-007: Vite ✅
- ADR-008: Resend para email ✅
- ADR-009: Budget como fuente de verdad para límites ✅

### Próximas Decisiones a Documentar

- [ ] Testing framework (Jest vs Vitest)
- [ ] State management para datos del server (react-query?)
- [ ] Deployment strategy
