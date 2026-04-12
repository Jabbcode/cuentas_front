# 🧠 Frontend Engineering Skills (Stack: shadcn/ui + React)

Este directorio contiene el "Manual de Operaciones" para el desarrollo frontend del proyecto. Cada skill define patrones técnicos, restricciones de diseño y estándares de calidad que deben seguirse estrictamente.

## 🏗️ Core Stack & Arquitectura
- **UI:** shadcn/ui (Radix UI + Tailwind CSS).
- **Forms:** React Hook Form + Zod.
- **Fetching:** Axios + JWT Auth.
- **Routing:** React Router v7.

---

## 📚 Catálogo de Skills Documentadas

### 1. 🧩 Component Composition (shadcn/ui focus)
- **Descripción:** Creación de componentes atómicos y compuestos altamente reutilizables.
- **Cuándo usar:** Al crear componentes base o maquetar interfaces complejas con slots.
- **Recursos:** [`SKILL.md`](./component-composition-skill/SKILL.md) | [`EXAMPLES.md`](./component-composition-skill/EXAMPLES.md)

### 2. 📝 Form Management
- **Descripción:** Gestión de formularios Type-safe con validación de esquemas Zod.
- **Cuándo usar:** Login, registros, edición de perfiles y cualquier entrada de datos.
- **Recursos:** [`SKILL.md`](./form-management-skill/SKILL.md) | [`EXAMPLES.md`](./form-management-skill/EXAMPLES.md)

### 3. 🌐 Data Fetching
- **Descripción:** Comunicación con backend, interceptores Axios y gestión de sesiones JWT.
- **Cuándo usar:** Llamadas a API, sincronización de datos y manejo de errores globales de red.
- **Recursos:** [`SKILL.md`](./data-fetching-skill/SKILL.md) | [`EXAMPLES.md`](./data-fetching-skill/EXAMPLES.md)

### 4. 🗺️ Routing & Protection
- **Descripción:** Navegación SPA, protección de rutas privadas y Lazy Loading.
- **Cuándo usar:** Definir nuevas páginas o restringir accesos según rol/autenticación.
- **Recursos:** [`SKILL.md`](./routing-skill/SKILL.md) | [`EXAMPLES.md`](./routing-skill/EXAMPLES.md)

### 5. ⚡ State Management
- **Descripción:** Gestión de estado local y compartido con Context API y Custom Hooks.
- **Cuándo usar:** Compartir datos entre componentes sin Prop Drilling (ej: AuthContext, Theme).
- **Recursos:** [`SKILL.md`](./state-management-skill/SKILL.md) | [`EXAMPLES.md`](./state-management-skill/EXAMPLES.md)

### 6. 🎨 Styling & Design System
- **Descripción:** Estilizado con Tailwind CSS, utilidades `cn` y variantes de shadcn.
- **Cuándo usar:** Diseño responsivo, estados de interacción y Dark Mode.
- **Recursos:** [`SKILL.md`](./styling-skill/SKILL.md) | [`EXAMPLES.md`](./styling-skill/EXAMPLES.md)

---

### 7. 🔍 TypeScript Verification
- **Descripción:** Protocolo obligatorio de compilación y chequeo de tipos antes de cada entrega.
- **Cuándo usar:** Siempre, antes de dar por terminada cualquier tarea de código.
- **Recursos:** [`typescript-verification.md`](../typescript-verification.md)

---

## 🎯 Instrucciones para la IA (Claude)

Para asegurar la máxima calidad en el código generado, utiliza este protocolo:

1. **Identificación:** Antes de codificar, identifica qué skills son necesarios para la tarea actual (ej: "Necesito `form-management` y `styling`").
2. **Contexto:** Lee siempre el archivo `SKILL.md` correspondiente para entender las restricciones (`Anti-Patterns`) y las reglas de oro.
3. **Referencia:** Utiliza el archivo `EXAMPLES.md` como plantilla de estructura para no inventar patrones nuevos.
4. **Validación:** Al finalizar, pasa el "Checklist de Validación" que se encuentra al final de cada `SKILL.md`.

## 📌 Convención de Nombres
- `SKILL.md`: Instrucciones de sistema y reglas técnicas.
- `EXAMPLES.md`: Fragmentos de código real "Bad vs Good".
- `README.md`: Resumen ejecutivo de la carpeta.

---
*Nota: Este sistema de skills está optimizado para trabajar con el componente `cn` de shadcn/ui y tipado estricto de TypeScript.*