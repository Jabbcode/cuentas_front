# Workflow - api-integration-agent (The Connector)

## 1. Fase de Análisis de Contrato
- Define las interfaces de Entrada (Request) y Salida (Response).
- Determina la estrategia de fetching (Query vs Mutation).

## 2. Fase de Estructuración (File System)
- Localiza o crea el servicio en `src/services/api/`.
- Define los tipos en un archivo `.types.ts` dedicado para escalabilidad.

## 3. Fase de Implementación Silenciosa
- Escribe el cliente API (Axios/Fetch) siguiendo las `conventions.md`.
- Implementa el hook de datos con manejo de estados `loading`, `error` y `data`.
- Aplica transformadores de datos si la API no coincide con las necesidades de la UI.

## 4. Validación Técnica
- Verifica la coherencia de los tipos en todo el flujo de datos.
- Ejecuta internamente 'typescript-verification.md'.

## 5. Reporte de Salida
- Retorna al Meta-Agente las rutas de los servicios/hooks creados y el estado de la validación.