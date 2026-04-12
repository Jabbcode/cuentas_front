# Workflow - hook-creator-agent

## Pasos Operativos
1. **Input**: Recibe la instrucción y el contexto de la lógica de estado.
2. **Análisis de Abstracción**: Consulta la `logic-abstraction-skill` para determinar si la lógica requiere `useMemo`, `useCallback` o un `useReducer`.
3. **Implementación Silenciosa**: Crea o modifica el archivo `.ts` directamente en el sistema de archivos local.
4. **Validación TypeScript**: Verifica que los tipos de retorno sean explícitos y no existan errores de compilación.
5. **Reporte**: Confirma la ruta del archivo y las capacidades clave del hook al Meta-Agente.

## Entradas Esperadas
- Descripción de la lógica y estado.
- Parámetros de entrada y valores de retorno esperados.

## Salidas Esperadas
- Archivo de hook funcional y optimizado.
- Cumplimiento total de las "Rules of Hooks".