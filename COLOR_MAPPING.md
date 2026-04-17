# Mapeo de Colores - Slate & Cobalt Palette

## Reemplazos a Realizar

### Fondos
| Antes | Después | Uso |
|-------|---------|-----|
| `dark:bg-[#020617]` | `dark:bg-[hsl(222_47%_4%)]` | Fondo base profundo |
| `dark:bg-[#0F172A]` | `dark:bg-[hsl(222_47%_7%)]` | Superficie base (cards) |
| `dark:bg-[#1E293B]` | `dark:bg-[hsl(222_47%_11%)]` | Elementos elevados |

### Bordes
| Antes | Después | Uso |
|-------|---------|-----|
| `dark:border-[hsl(215_20%_25%)]` | `dark:border-[hsl(217_33%_18%)]` | Bordes definidos |
| `dark:hover:border-[hsl(215_20%_35%)]` | `dark:hover:border-[hsl(217_33%_28%)]` | Bordes en hover |

### Texto
| Antes | Después | Uso |
|-------|---------|-----|
| `dark:text-[#F8FAFC]` | Mantener (equivale a hsl(210 40% 98%)) | Texto principal |
| `dark:text-[#CBD5E1]` | `dark:text-[hsl(215_20%_65%)]` | Texto secundario |
| `dark:text-[#64748B]` | `dark:text-[hsl(215_20%_65%)]` | Texto muted |

### Colores Semánticos - Success (Verde Esmeralda)
| Antes | Después |
|-------|---------|
| `dark:bg-green-500/10` | `dark:bg-[hsl(142_76%_12%)]` |
| `dark:text-green-400` | `dark:text-[hsl(142_76%_45%)]` |

### Colores Semánticos - Warning (Ámbar Vibrante)
| Antes | Después |
|-------|---------|
| `dark:bg-yellow-500/10` | `dark:bg-[hsl(48_96%_12%)]` |
| `dark:text-yellow-400` | `dark:text-[hsl(48_96%_53%)]` |

### Colores Semánticos - Error (Rojo Suave)
| Antes | Después |
|-------|---------|
| `dark:bg-red-500/10` | `dark:bg-[hsl(0_84%_12%)]` |
| `dark:text-red-400` | `dark:text-[hsl(0_84%_65%)]` |

### Colores Semánticos - Info/Primary (Cyan/Azul)
| Antes | Después |
|-------|---------|
| `dark:bg-blue-500/10` | `dark:bg-[hsl(199_89%_12%)]` o `dark:bg-[hsl(217_91%_12%)]` |
| `dark:text-blue-400` | `dark:text-[hsl(199_89%_54%)]` o `dark:text-[hsl(217_91%_60%)]` |

## Archivos a Actualizar
- [ ] src/components/ui/*.tsx (todos)
- [ ] src/components/layout/*.tsx (todos)
- [ ] src/components/dashboard/*.tsx (todos)
- [ ] src/pages/*.tsx (todos)
