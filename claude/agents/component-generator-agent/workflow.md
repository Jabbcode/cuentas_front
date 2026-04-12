# Workflow - component-generator-agent (The Builder)

## 1. Fase de Análisis de Composición
- Evalúa si el componente debe ser un Client Component (`'use client'`) o Server Component.
- Identifica qué componentes de `shadcn/ui` o iconos de `lucide-react` son necesarios.

## 2. Fase de Estructuración (File System)
- Crea la carpeta del componente en la ruta indicada.
- Genera el archivo principal `.tsx` y el archivo de tipos `.types.ts` si la complejidad lo requiere.

## 3. Fase de Implementación Silenciosa
- Escribe el código directamente en el archivo local.
- Aplica las utilidades de `styling-skill` (Tailwind + `cn`).
- Define Interfaces de Props robustas y documentadas.

## 4. Validación Técnica
- Verifica que el componente compile sin errores de tipos.
- Comprueba que no existan variables sin usar.

## 5. Reporte de Salida
- Retorna al Meta-Agente únicamente las rutas de los archivos creados y el estatus del build local.