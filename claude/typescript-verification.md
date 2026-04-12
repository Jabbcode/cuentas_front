# 🔍 TypeScript Verification Protocol

**Archivo:** /claude/typescript-verification.md
**Nivel de Prioridad:** CRÍTICO / BLOQUEANTE

---

## 🎯 Propósito
Garantizar que ninguna implementación se reporte como completada si contiene errores de tipado. Actúa como un "Guardrail" para prevenir fallos en el deploy (CI/CD) causados por incompatibilidades de tipos, especialmente entre los datos del Backend (Prisma/Decimal) y el Frontend.

---

## 🔄 Flujo de Verificación Obligatorio

Antes de entregar cualquier tarea, Claude debe verificar:

### PASO 1: Verificación de Tipos (Static Analysis)
Comando: npx tsc --noEmit
Meta: 0 errores. Si este comando falla, la tarea NO está terminada.

### PASO 2: Verificación de Build (Bundling)
Comando: npm run build
Meta: Éxito total. Asegura que Vite y Tailwind 4 procesen todo correctamente.

---

## ⚠️ Errores Críticos y Soluciones (Cuentas Project)

### 1. El Conflicto Decimal (Prisma) vs number (JS)
- Error (TS2367): if (expense.amount > 100)
- Solución: if (expense.amount.toNumber() > 100) o if (expense.amount.gt(100))

### 2. Objetos "Possibly Null or Undefined" (TS2531)
- Error: const name = user.profile.name;
- Solución: const name = user?.profile?.name ?? 'Invitado';

### 3. Inferencia de Zod en Formularios
- Error: Crear interfaces manuales para formularios.
- Solución: type FormData = z.infer<typeof schema>;

---

## 🔐 Reglas de Oro (No Negociables)

1. PROHIBIDO el uso de 'any': Usar 'unknown' y estrechar el tipo.
2. PROHIBIDO '@ts-ignore': Los errores de tipos deben resolverse en la raíz.
3. Tipado de API: Todas las funciones en api/*.api.ts deben tener retorno explícito Promise<T>.
4. Sincronización: Interfaces de negocio centralizadas en src/types/index.ts.

---

## 🚀 Reporte de Verificación (Checklist)

| Verificación | Comando | Resultado |
|--------------|---------|-----------|
| Check de Tipos | npx tsc --noEmit | ✅ 0 Errores |
| Build de Vite | npm run build | ✅ SUCCESS |
| Clean Code | Sin console.log | ✅ OK |

---

## 📝 Mensaje de Confirmación Final
Para dar por cerrada una tarea, Claude debe escribir:
"✅ BUILD SUCCESSFUL: He verificado la implementación con el compilador de TypeScript. No hay errores de tipo y el build de producción es exitoso."

---
Última actualización: 2026-04-12
Estado: Activo / Obligatorio