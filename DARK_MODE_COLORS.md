# 🎨 Sistema de Colores Dark Mode - MisCuentas App

Basado en recomendaciones de UI/UX Pro Max para aplicaciones financieras profesionales.

## Paleta Base

### Backgrounds (Fondos)
- **Deep Black**: `#020617` (hsl(222 47% 2%)) - Fondo principal OLED
- **Surface**: `#0F172A` (hsl(222 47% 8%)) - Tarjetas y contenedores
- **Surface Elevated**: `#1E293B` (hsl(215 25% 15%)) - Elementos elevados (modales, dropdowns)

### Text (Texto)
- **Primary**: `#F8FAFC` (hsl(210 40% 98%)) - Texto principal (contraste AAA)
- **Secondary**: `#CBD5E1` (hsl(214 32% 83%)) - Texto secundario
- **Muted**: `#64748B` (hsl(215 16% 47%)) - Texto deshabilitado/placeholder

### Borders (Bordes)
- **Default**: `hsl(215 20% 25%)` - Bordes sutiles pero visibles
- **Hover**: `hsl(215 20% 35%)` - Bordes en hover

## Colores Semánticos

### Success (Éxito/Positivo)
- **Primary**: `#22C55E` (hsl(142 71% 45%)) - Verde para valores positivos
- **Background**: `hsl(142 71% 20% / 0.15)` - Fondo verde translúcido
- **Border**: `hsl(142 71% 35%)` - Borde verde

### Error (Error/Negativo)
- **Primary**: `#DC2626` (hsl(0 72% 51%)) - Rojo para valores negativos
- **Background**: `hsl(0 72% 20% / 0.15)` - Fondo rojo translúcido
- **Border**: `hsl(0 72% 35%)` - Borde rojo

### Warning (Advertencia)
- **Primary**: `#F59E0B` (hsl(38 92% 50%)) - Oro para advertencias
- **Background**: `hsl(38 92% 20% / 0.15)` - Fondo dorado translúcido
- **Border**: `hsl(38 92% 35%)` - Borde dorado

### Info/Primary (Información/Principal)
- **Primary**: `#3B82F6` (hsl(217 91% 60%)) - Azul principal
- **Background**: `hsl(217 91% 20% / 0.15)` - Fondo azul translúcido
- **Border**: `hsl(217 91% 35%)` - Borde azul

## Uso en Código

### Tailwind Classes
```tsx
// Fondos
<div className="bg-gray-50 dark:bg-[#020617]">           {/* Fondo principal */}
<div className="bg-white dark:bg-[#0F172A]">             {/* Tarjetas */}
<div className="bg-gray-100 dark:bg-[#1E293B]">          {/* Elementos elevados */}

// Texto
<h1 className="text-gray-900 dark:text-[#F8FAFC]">       {/* Títulos */}
<p className="text-gray-600 dark:text-[#CBD5E1]">        {/* Texto secundario */}
<span className="text-gray-400 dark:text-[#64748B]">    {/* Texto muted */}

// Bordes
<div className="border-gray-200 dark:border-[hsl(215_20%_25%)]">

// Estados Semánticos
<div className="bg-green-100 dark:bg-green-500/10">     {/* Success bg */}
<div className="text-green-600 dark:text-green-400">    {/* Success text */}

<div className="bg-red-100 dark:bg-red-500/10">         {/* Error bg */}
<div className="text-red-600 dark:text-red-400">        {/* Error text */}

<div className="bg-yellow-100 dark:bg-yellow-500/10">   {/* Warning bg */}
<div className="text-yellow-600 dark:text-yellow-400">  {/* Warning text */}

<div className="bg-blue-100 dark:bg-blue-500/10">       {/* Info bg */}
<div className="text-blue-600 dark:text-blue-400">      {/* Info text */}
```

## Recomendaciones UX

### Contraste
- Ratio mínimo 4.5:1 para texto normal (WCAG AA)
- Ratio mínimo 7:1 para texto importante (WCAG AAA)
- Todos los colores definidos cumplen AAA

### Tipografía
- Font: IBM Plex Sans (profesional, legible, fintech-friendly)
- Peso ligero (300) para números grandes
- Peso medio (500) para labels
- Peso bold (600-700) para títulos

### Efectos
- Minimal glow en textos importantes: `text-shadow: 0 0 10px rgba(255,255,255,0.1)`
- Transiciones suaves: `transition-colors duration-200`
- Evitar animaciones pesadas que consuman batería en OLED

### Accesibilidad
- `prefers-reduced-motion` para animaciones
- Focus states siempre visibles
- No usar solo color para comunicar información

## Ejemplos de Componentes

### Card (Tarjeta)
```tsx
<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-[hsl(215_20%_25%)] dark:bg-[#0F172A]">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F8FAFC]">
    Balance Total
  </h3>
  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
    $12,345.67
  </p>
</div>
```

### Input (Campo de entrada)
```tsx
<input
  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[hsl(215_20%_25%)] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B]"
  placeholder="Buscar transacciones..."
/>
```

### Button Primary
```tsx
<button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
  Crear Transacción
</button>
```

## Herramientas
- Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Palette: https://coolors.co/020617-0f172a-1e293b-f8fafc-22c55e-dc2626-f59e0b-3b82f6
