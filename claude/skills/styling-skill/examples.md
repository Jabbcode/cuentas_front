# Ejemplos: Styling with TailwindCSS

## ✅ Patrón Recomendado: Clases Condicionales (Utility `cn`)
Este patrón evita que las clases se pisen entre sí cuando pasas `className` como prop.

```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilidad recomendada
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-lg transition-colors font-medium', // Base
        variants[variant],                                   // Variante
        className                                            // Override externo
      )}
      {...props}
    />
  );
};

<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
      Título Responsivo
    </h3>
  </div>
</section>