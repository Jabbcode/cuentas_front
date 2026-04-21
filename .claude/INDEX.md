# 📑 Índice Completo - Carpeta Claude Frontend

Guía rápida de todos los archivos disponibles en `./claude`.

## 📌 Navegación Rápida

### Necesito Entender...

| Necesito                      | Archivo                                 | Descripción                    |
| ----------------------------- | --------------------------------------- | ------------------------------ |
| **El proyecto**               | `context.md`                            | Qué es, stack, estado          |
| **Cómo escribir código**      | `conventions.md`                        | Nombres, estructura, patrones  |
| **Instrucciones para Claude** | `system-prompt.md`                      | Cómo debería trabajar          |
| **Estado actual**             | `project-state.md`                      | Sprints, bugs, próximos pasos  |
| **Arquitectura general**      | `architecture/overview.md`              | Diagramas y flujos             |
| **Cómo funcionan los hooks**  | `architecture/hooks.md`                 | Catálogo detallado             |
| **Cómo hacer HTTP requests**  | `architecture/api-client.md`            | Cliente Axios y patterns       |
| **Un ejemplo real**           | `examples/hooks/useAccounts-example.md` | Hook bien hecho                |
| **Decisiones pasadas**        | `decisions/ADR-decisions.md`            | Por qué usamos X en lugar de Y |

## 📂 Estructura de Carpetas

```
claude/
├── README.md
│   └─ Este documento (índice)
│
├── 📋 DOCUMENTACIÓN PRINCIPAL
│   ├── context.md              # Descripción del proyecto
│   ├── conventions.md          # Cómo escribir código
│   ├── system-prompt.md        # Instrucciones para Claude
│   └── project-state.md        # Estado actual
│
├── 🏗️ ARQUITECTURA (architecture/)
│   ├── overview.md             # Diagrama general + flujos
│   ├── hooks.md               # Catálogo de custom hooks
│   ├── api-client.md          # Cliente HTTP + patterns
│   │
│   └─ Próximos (puede agregar):
│       ├── components.md      # Estructura de componentes
│       └── state-management.md # Cómo manejar estado
│
├── 💡 EJEMPLOS REALES (examples/)
│   ├── hooks/
│   │   └── useAccounts-example.md    # Hook bien implementado
│   │
│   ├── components/
│   │   └─ (futuros ejemplos de componentes)
│   │
│   └── services/  (si aplica)
│
├── 📖 DECISIONES ARQUITECTÓNICAS (decisions/)
│   └── ADR-decisions.md        # Registro de decisiones
│       ├── ADR-001: Context API vs Redux
│       ├── ADR-002: Axios vs Fetch
│       ├── ADR-003: Zod para validación
│       ├── ADR-004: TailwindCSS
│       ├── ADR-005: Custom Hooks
│       ├── ADR-006: TypeScript Strict
│       └── ADR-007: Vite
│
└── 📚 GUIDELINES (guidelines/)
    └─ (Próximos archivos):
        ├── code-style.md
        ├── testing-strategy.md
        ├── error-handling.md
        └── documentation.md
```

## 🔍 Búsqueda por Tópico

### 🔐 Autenticación

- Ver: `context.md` → sección "Autenticación"
- Ver: `architecture/api-client.md` → sección "Interceptores"

### 📡 Llamadas HTTP

- Ver: `architecture/api-client.md` (completo)
- Ver: `examples/hooks/useAccounts-example.md` → Cómo usar API

### ⚛️ React & Hooks

- Ver: `architecture/hooks.md` (catálogo completo)
- Ver: `examples/hooks/useAccounts-example.md` (ejemplo real)
- Ver: `conventions.md` → sección "Patrones de Código"

### 💾 Manejo de Estado

- Ver: `architecture/overview.md` → sección "Estado: Dónde Vive"
- Ver: `conventions.md` → sección "Manejo de Estado"

### 🎨 Estilos y Componentes

- Ver: `conventions.md` → sección "TailwindCSS"
- Ver: `decisions/ADR-decisions.md` → ADR-004

### 🧪 Testing

- Ver: `examples/hooks/useAccounts-example.md` → sección "Testing"
- Ver: `guidelines/` (cuando se cree)

### 🐛 Debugging

- Ver: `project-state.md` → sección "Bugs Conocidos"
- Ver: `architecture/overview.md` → sección "Performance"

## 📚 Flujo de Lectura Recomendado

**Para nuevos desarrolladores:**

1. Empezar con `README.md` (este archivo)
2. Leer `context.md` (qué es el proyecto)
3. Leer `conventions.md` (cómo escribir código)
4. Revisar `architecture/overview.md` (cómo funciona)
5. Ver `examples/` (código real)

**Para escribir una feature:**

1. Revisar `conventions.md` para naming
2. Buscar ejemplo similar en `examples/`
3. Consultar `architecture/` si necesitas entender un pattern
4. Ejecutar → PR → actualizar `project-state.md`

**Para entender una decisión:**

1. Ir a `decisions/ADR-decisions.md`
2. Buscar la ADR relevante
3. Leer problema, contexto, decisión, justificación

## 🔗 Enlaces de Referencia

- **Stack Overview:** `context.md` → "Stack Tecnológico"
- **API Endpoints:** `architecture/api-client.md` → "Listado de Endpoints"
- **Tipos TypeScript:** `src/types/index.ts` (en el código)
- **Variables de Entorno:** `context.md` → "Variables de Entorno"

## ✅ Checklist: Qué Revisar Antes de Hacer un PR

Antes de hacer cualquier cambio, revisa:

- [ ] `conventions.md` → naming y estructura
- [ ] `architecture/` → patrones existentes
- [ ] `examples/` → cómo se hace en este proyecto
- [ ] `system-prompt.md` → qué espera Claude

## 🚀 Cómo Actualizar Esta Carpeta

Cuando agregues o cambies algo:

1. Documenta en el archivo relevante
2. Actualiza `project-state.md` si es significativo
3. Considera si necesitas un ADR en `decisions/`
4. Agrega un ejemplo en `examples/` si es un patrón nuevo

## 📝 Archivos Todavía por Crear

Estos archivos estarían bien tener (crear en PRs futuras):

```
guidelines/
├── code-style.md           # ESLint, formatting, best practices
├── testing-strategy.md     # Testing patterns y cobertura
├── error-handling.md       # Cómo manejar errores
├── documentation.md        # Cómo documentar código
└── performance.md          # Optimizaciones

architecture/
├── components.md           # Estructura de componentes
├── state-management.md     # Context API guide
└── routing.md             # React Router setup

examples/
├── components/
│   ├── Form-component.tsx.md
│   ├── List-component.tsx.md
│   └── Modal-component.tsx.md
│
├── hooks/
│   ├── useFetch-pattern.md
│   ├── useForm-pattern.md
│   └── useModal-pattern.md
│
└── services/
    └── (si aplica)
```

## 💡 Pro Tips

1. **Ctrl+F es tu amigo:** Usa search en este índice
2. **Empieza pequeño:** Lee una sección, no todo
3. **Consulta ejemplos:** Siempre hay un ejemplo en `examples/`
4. **Pregunta a Claude:** Pasa este archivo a Claude para que te ayude
5. **Actualiza regularmente:** Mantén esta carpeta sincronizada con cambios

## 🎯 Propósito de Esta Carpeta

Esta carpeta existe para:

- ✅ No repetir explicaciones oralmente
- ✅ Mantener conocimiento centralizado
- ✅ Onboard nuevos desarrolladores rápido
- ✅ Dar contexto a Claude automáticamente
- ✅ Documentar decisiones importantes
- ✅ Mostrar ejemplos reales del proyecto

## 📞 Necesito Ayuda

Si no encuentras lo que buscas:

1. Busca en `context.md` o `conventions.md`
2. Mira `examples/` para código similar
3. Revisa `architecture/overview.md` para flujos
4. Pregunta en GitHub issues o a tu equipo

---

**Última actualización:** 2024
**Responsable:** Equipo de desarrollo
**Frecuencia de actualización:** Cada sprint o cuando hay cambios significativos
