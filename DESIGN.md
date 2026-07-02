---
name: MisCuentas
description: App personal de finanzas — sobria, precisa, los números son los protagonistas
colors:
  azul-tinta: '#2563eb'
  azul-tinta-deep: '#1d4ed8'
  azul-superficie: '#eff6ff'
  tinta-negra: '#111827'
  gris-medio: '#6b7280'
  gris-secundario: '#4b5563'
  gris-panel: '#f3f4f6'
  gris-borde: '#e5e7eb'
  fondo-blanco: '#ffffff'
  verde-ingreso: '#16a34a'
  verde-tinte: '#f0fdf4'
  rojo-gasto: '#dc2626'
  rojo-tinte: '#fef2f2'
  ambar-alerta: '#854d0e'
  ambar-tinte: '#fef9c3'
typography:
  display:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
components:
  button-primary:
    backgroundColor: '{colors.azul-tinta}'
    textColor: '{colors.fondo-blanco}'
    rounded: '{rounded.md}'
    height: '40px'
    padding: '8px 16px'
  button-primary-hover:
    backgroundColor: '{colors.azul-tinta-deep}'
  button-outline:
    backgroundColor: '{colors.fondo-blanco}'
    textColor: '{colors.tinta-negra}'
    rounded: '{rounded.md}'
    height: '40px'
    padding: '8px 16px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.gris-secundario}'
    rounded: '{rounded.md}'
    height: '40px'
  button-destructive:
    backgroundColor: '{colors.rojo-gasto}'
    textColor: '{colors.fondo-blanco}'
    rounded: '{rounded.md}'
    height: '40px'
  card:
    backgroundColor: '{colors.fondo-blanco}'
    textColor: '{colors.tinta-negra}'
    rounded: '{rounded.lg}'
    padding: '24px'
  input:
    backgroundColor: '{colors.fondo-blanco}'
    textColor: '{colors.tinta-negra}'
    rounded: '{rounded.md}'
    height: '40px'
    padding: '8px 12px'
  badge-status:
    rounded: '{rounded.full}'
    padding: '2px 10px'
  nav-item-active:
    backgroundColor: '{colors.azul-superficie}'
    textColor: '{colors.azul-tinta-deep}'
    rounded: '{rounded.lg}'
    padding: '10px 12px'
---

# Design System: MisCuentas

## 1. Overview

**Creative North Star: "El Libro Mayor"**

MisCuentas es un libro mayor contable moderno: cada cifra en su sitio, cero ornamento,
confianza por claridad. La interfaz es una herramienta de precisión para un solo usuario
que entra varias veces al día a consultar y registrar; debe responder en segundos la
pregunta "¿cuánto hay, cuánto debo, qué viene?". Los números son los protagonistas: la
jerarquía visual la dictan los datos (balance grande, contexto pequeño), nunca la decoración.

El sistema rechaza explícitamente el dashboard SaaS genérico (grids de cards idénticas,
métricas gigantes sin jerarquía), la banca tradicional (corporativa, fría) y la
gamificación (confeti, badges infantiles). Es fintech seria en tono doméstico: densidad
de información con respiro, tema claro, una sola familia tipográfica.

**Key Characteristics:**

- Tema claro único: fondo blanco, tinta casi negra, un solo acento azul.
- Color solo con significado: verde = ingreso, rojo = gasto, ámbar = alerta.
- Componentes refinados y contenidos — la UI cede protagonismo al dato.
- Elevación ambiental sutil: sombras mínimas omnipresentes, nunca dramáticas.

## 2. Colors: La Paleta del Libro Mayor

Neutros fríos sobre blanco con un único acento azul de acción y un trío semafórico semántico.

### Primary

- **Azul Tinta** (#2563eb): como tinta de pluma sobre papel contable. Acciones primarias,
  enlaces, foco, marca ("MisCuentas") y estado activo de navegación. Hover: **Azul Tinta
  Profundo** (#1d4ed8). Tinte de superficie: **Azul Superficie** (#eff6ff) para el ítem
  de navegación activo y chips informativos.

### Neutral

- **Tinta Negra** (#111827): texto de datos y titulares. Todo número relevante se escribe en tinta.
- **Gris Secundario** (#4b5563): texto de apoyo y botones ghost. Mínimo aceptable para prosa.
- **Gris Medio** (#6b7280): solo labels y metadatos cortos, nunca párrafos (4.6:1 no alcanza AAA).
- **Gris Panel** (#f3f4f6): fondos de hover, botones secundarios, barras de progreso en reposo.
- **Gris Borde** (#e5e7eb): bordes de cards, divisores, contornos de input (#d1d5db en inputs).
- **Fondo Blanco** (#ffffff): superficie universal — página y cards comparten fondo; el borde separa.

### Semánticos (rol fijo, no intercambiables)

- **Verde Ingreso** (#16a34a) sobre **Verde Tinte** (#f0fdf4): ingresos, balances positivos, éxito.
- **Rojo Gasto** (#dc2626) sobre **Rojo Tinte** (#fef2f2): gastos, balances negativos, destructivo.
- **Ámbar Alerta** (#854d0e) sobre **Ámbar Tinte** (#fef9c3): avisos, límites cercanos, vencimientos.

### Named Rules

**La Regla del Semáforo.** Verde es ingreso, rojo es gasto, ámbar es alerta — siempre y solo
eso. El color semántico nunca aparece solo: lo acompaña un signo (+/−) o un icono, porque el
color no es el único portador de significado (AAA).

**La Regla de la Tinta.** El Azul Tinta marca acción e identidad, nunca decoración. Si un
elemento azul no es clickeable ni es la marca, está mal pintado.

## 3. Typography

**Display Font:** Inter (con system-ui, sans-serif)
**Body Font:** Inter (misma familia)

**Character:** Una sola voz humanista-neutra en cinco pesos de jerarquía. Inter desaparece
ante los números: tabular, legible, sin personalidad que compita con los datos.

### Hierarchy

- **Display** (700, 1.875rem → 2.25rem en lg, lh 1.2): el número protagonista — balance neto,
  total de deuda. Uno por pantalla.
- **Headline** (700, 1.5rem, lh 1.3): título de página.
- **Title** (600, 1.125rem, lh 1.2, tracking-tight): título de card y modal.
- **Body** (400, 0.875rem, lh 1.5): texto general, filas de tabla, formularios.
- **Label** (500, 0.75rem, lh 1.4): metadatos, encabezados de columna, badges.

### Named Rules

**La Regla del Protagonista.** El tamaño tipográfico es proporcional a la importancia del
dato, no a la del componente. Un solo Display por vista; si todo grita, nada se oye.

## 4. Elevation

Elevación ambiental: sombras sutiles omnipresentes que dan profundidad suave sin dramatismo.
Toda card lleva `shadow-sm` en reposo sobre su borde gris; la sombra confirma la capa, el
borde la define. Los overlays (modales, dropdowns) son el único salto real de elevación.

### Shadow Vocabulary

- **Ambiental** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): cards, inputs, botones secundarios.
- **Realce** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): botones primarios.
- **Overlay** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` + scrim negro 50%): modales y menús flotantes.

### Named Rules

**La Regla del Papel.** Todo vive a un milímetro de la mesa. Nada flota alto salvo lo que
interrumpe (modal); si una card proyecta más sombra que un modal, está rota.

## 5. Components

Refinados y contenidos: radios moderados, estados sutiles, la UI cede protagonismo al dato.

### Buttons

- **Shape:** esquinas suavemente curvas (6px), altura 40px (36px sm / 44px lg), texto 0.875rem medium.
- **Primary:** Azul Tinta sobre blanco, sombra Realce; hover Azul Tinta Profundo.
- **Hover / Focus:** transición de color 150ms; foco visible `ring-2` azul con offset 2px — nunca se elimina.
- **Outline:** borde #d1d5db sobre blanco, hover Gris Panel. **Ghost:** transparente, hover Gris Panel.
- **Destructive / Success:** Rojo Gasto / Verde Ingreso sobre blanco, mismos estados.

### Badges (estado)

- **Style:** píldora completa (radio full), 0.75rem semibold, padding 2px 10px.
- **State:** tinte de fondo + texto oscuro del mismo hue (verde-100/verde-800, rojo, ámbar);
  variante default Azul Tinta sólido con texto blanco.

### Cards / Containers

- **Corner Style:** 8px.
- **Background:** Fondo Blanco con borde Gris Borde.
- **Shadow Strategy:** Ambiental en reposo (ver Elevation).
- **Internal Padding:** 24px (header/content), 16px en móvil para cards densas.

### Inputs / Fields

- **Style:** borde #d1d5db, fondo blanco, 6px de radio, altura 40px, texto 0.875rem.
- **Focus:** `ring-2` Azul Tinta con offset blanco 2px, sin cambio de borde.
- **Error / Disabled:** error en Rojo Gasto (borde + mensaje); disabled opacidad 50% + cursor bloqueado.

### Navigation (Sidebar)

- **Style:** panel blanco fijo de 256px con borde derecho; en móvil, drawer con scrim negro 50%
  y transición transform 300ms.
- **Items:** 0.875rem medium, icono 20px + label, radio 8px, padding 10px 12px.
- **Estados:** activo = Azul Superficie + Azul Tinta Profundo; reposo = Gris Secundario;
  hover = Gris Panel + Tinta Negra. Logout: hover Rojo Tinte + Rojo Gasto.

### Hero de Balance (componente distintivo)

La primera card del dashboard: Display en verde o rojo según signo del balance, icono de
tendencia en círculo tintado, barra de progreso de gasto mensual (verde → ámbar >80% →
rojo >100%) y trío ingresos/gastos/días sobre tintes semánticos. Es la respuesta de un
vistazo a "¿cómo voy este mes?".

## 6. Do's and Don'ts

### Do:

- **Do** usar los tintes semánticos (verde-tinte, rojo-tinte, ámbar-tinte) como fondo y su
  tono oscuro como texto — siempre el par completo, nunca mezclado entre hues.
- **Do** acompañar todo color semántico con signo o icono (Regla del Semáforo, AAA).
- **Do** mantener un solo número Display por vista; el resto en Title o Body.
- **Do** conservar el anillo de foco visible (`ring-2` azul, offset 2) en todo elemento interactivo.
- **Do** respetar `prefers-reduced-motion`: las transiciones de drawer y progreso pasan a instantáneas.

### Don't:

- **Don't** construir un "dashboard SaaS genérico": grids de cards idénticas con
  icono + cifra + label repetidos. Cada card del dashboard justifica su forma por su dato.
- **Don't** caer en "banca tradicional": corporativa y fría. El Azul Tinta es de acción, no
  un azul-banco que baña la interfaz.
- **Don't** gamificar: nada de confeti, medallas ni tono infantil, ni siquiera al saldar una deuda.
- **Don't** usar Gris Medio (#6b7280) en párrafos — 4.6:1 incumple el objetivo AAA; mínimo Gris Secundario.
- **Don't** añadir nuevos `border-l-4` de color como acento lateral (el Hero de Balance actual
  es la excepción legada; el patrón no se extiende a nuevos componentes).
- **Don't** usar clases de paleta cruda nuevas (`purple-*`, `pink-*`...): todo color nuevo entra
  primero a esta paleta con rol y nombre.
- **Don't** introducir una segunda familia tipográfica ni dark mode parcial; el sistema es
  Inter + tema claro, completo o nada.
